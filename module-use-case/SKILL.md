---
name: module-use-case
description: Criar, revisar ou orientar a implementação de casos de uso de módulo (application services) no padrão Genérico. Usar quando o pedido envolver "caso de uso", "use case", arquivos `*.use-case.ts`, orquestração de entidades/repositórios/queries, regras de negócio de aplicação, mapeamento de falhas com `Result`, criação/ajuste de testes de use case ou a skill `module-use-case`.
---

# Module Use Case

## Overview

Aplicar o padrão de casos de uso do projeto com foco em orquestração de dependências, validações de fluxo, retorno consistente com `Result` e testes que cubram caminhos de sucesso e falha.

## Guidelines

- Ler `references/use-case-pattern.md` antes de criar ou alterar use cases.
- Implementar o contrato `UseCase<IN, OUT>` com `execute(data: IN): Promise<Result<OUT>>`.
- Declarar em `IN` os tipos esperados sempre que forem conhecidos. Reservar `unknown` para entradas cujo formato seja genuinamente desconhecido.
- No controller, converter parâmetros de rota, filtros e corpo HTTP nos tipos de `IN` antes de chamar `execute`. Deixar a validação das regras de negócio no caso de uso, na entidade ou no Value Object responsável.
- Declarar `XxxIn` e, quando houver, `XxxOut` no próprio arquivo do use case, com o nome da operação (`CriarPedidoIn`, `CriarPedidoOut`). São os únicos tipos declarados ali: filtros, projeções e demais DTOs ficam em `dto/`, um por arquivo, e são importados.
- Declarar em cada `XxxIn` todos os seus campos, de forma independente dos outros use cases. Não criar interface ou DTO para compartilhar campos entre entradas de use cases diferentes, nem fazer um `XxxIn` estender outro, mesmo quando os campos se repetem.
- Reportar falhas esperadas somente com `Result`, conforme o `README.md` do pacote compartilhado. Não criar classes de erro do agregado, não criar helpers próprios para converter exceção em `Result` e não deixar `throw` atravessar o `execute`. Códigos de falha seguem o formato `entidade.motivo`.
- Uma falha carrega só os códigos. Não anexar o valor recusado, o nome da classe ou do use case nem outro contexto. Quando quem chama precisa de dados para decidir o próximo passo (por exemplo, quais itens exigem confirmação), a operação não falhou: declarar `XxxOut` como união discriminada por `status`, com os dados de cada variante, e devolver `Result.ok(...)`.
- Não receber conversores injetados nem depender de Facade. Montar a saída com `Entidade.toDTO`, com métodos do objeto de valor, com um serviço de domínio quando a regra é compartilhada, ou no próprio use case quando é pontual.
- Manter o use case como orquestrador: valida fluxo, chama providers/repos/queries e delega invariantes para entidades/VOs.
- Injetar dependências via construtor com interfaces de provider/repository/query.
- Tratar falhas cedo (`early return`) com `Result.fail(...)` ou `result.withFail`.
- Não escrever `try`/`catch` no use case: as portas devolvem `Result`. Quando uma etapa não pode deixar escapar uma exceção inesperada (por exemplo, o sistema externo já aceitou a operação e o estado local precisa registrar isso), mover a etapa para um método privado e chamá-la com `Result.tryAsync(() => this.etapa(...))`, tratando o `Result` de falha.
- Ao deixar de emitir um código de falha, apagar a constante correspondente na mesma mudança.
- Evitar lógica de persistência/infra dentro do use case.
- O que atravessa uma porta é dado. Em uma alteração, carregar o estado com `repository.findById` (DTO), reconstruir a entidade com `Entidade.tryCreate(dto)` e gravar entregando `Entidade.toDTO(entidade)` ao Repository. Não passar a entidade para uma porta nem gravar um DTO montado à mão. Um caso de uso de leitura usa uma Query e não depende do Repository.
- Quando a operação depender de quem chama, receber `actor: Actor` (do pacote compartilhado) como campo de `IN` e autorizar dentro do `execute`, pela porta `AuthProvider` do módulo, antes de qualquer leitura ou efeito. Não comparar o tipo do usuário diretamente nem herdar de um caso de uso base que embute o tipo de usuário.
- Para atualização de estado, reaplicar validações de domínio com `tryCreate` ou `cloneWith`.

## Workflow

1. Definir `IN/OUT` e o contrato do use case.
2. Identificar dependências necessárias (repo, query, checker, provider).
3. Implementar `execute` com validações de pré-condição e retornos de falha imediatos.
4. Orquestrar criação/atualização de entidades via `tryCreate`/`cloneWith` quando necessário.
5. Persistir/consultar dados somente por interfaces de provider.
6. Cobrir testes com cenário feliz, validações de entrada e falhas de dependências. Se o use case autoriza, cobrir também a negação, o ator de sistema e a falha da consulta ao `AuthProvider`.

## References

Consultar `references/use-case-pattern.md` para paths, checklist, exemplos e armadilhas frequentes do projeto.
Consultar `../skills-standards.md` para convenção global de nomenclatura.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
