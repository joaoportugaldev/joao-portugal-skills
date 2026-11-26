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
- Manter o use case como orquestrador: valida fluxo, chama providers/repos/queries e delega invariantes para entidades/VOs.
- Injetar dependências via construtor com interfaces de provider/repository/query.
- Tratar falhas cedo (`early return`) com `Result.fail(...)` ou `result.withFail`.
- Evitar lógica de persistência/infra dentro do use case.
- Quando a operação depender de quem chama, receber `actor: Actor` (de `@sagil/shared`) como campo de `IN` e autorizar dentro do `execute`, pela porta `AuthProvider` do módulo, antes de qualquer leitura ou efeito. Não comparar o tipo do usuário diretamente nem estender `CasoDeUsoSuperAdmin`/`CasoDeUsoVendedor`. A regra completa está em `docs/adrs/shared/adr-shared-autorizacao-por-auth-provider.md`.
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
