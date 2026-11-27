---
name: backend-controller
description: >-
  Crie, revise ou migre controllers HTTP do backend Express. Use quando o pedido envolver arquivos *.controller.ts, rotas, autenticação, mapeamento de requisições, delegação a casos de uso ou facades, respostas HTTP ou registro na composição.
---

# Backend Controller

## Overview

Implemente o controller como adaptador de entrada HTTP no módulo proprietário. Ele registra rotas, prepara a entrada da operação e entrega a resposta conforme o contrato do endpoint.

## Guidelines

- Leia [controller-pattern.md](references/controller-pattern.md) antes de alterar um controller.
- Use um controller por recurso ou capacidade coesa. Reúna as operações desse recurso na mesma classe e liste os caminhos no construtor. Use o diretório de controllers já adotado pelo módulo, como `<módulo>/controllers/`.
- Injete os casos de uso diretamente; não crie nem use Facade para agrupá-los. Facades existentes são legado e saem quando o agregado é refatorado.
- Quando o `XxxOut` de um caso de uso é uma união discriminada por `status`, responda com status de sucesso e o desfecho no corpo. Não transforme um desfecho de sucesso em resposta de erro; o cliente lê `status` para decidir o próximo passo.
- Injete Express, as operações já compostas e o middleware de autenticação quando necessário. Centralize caminhos no construtor e registre cada rota em um método privado.
- Ao injetar um caso de uso diretamente, importe `UseCase<Entrada, Saída>` do pacote compartilhado. Use os tipos públicos da operação como parâmetros e deixe a construção da classe concreta na composição.
- Aplique a autenticação prevista e encaminhe quem chama como `Actor`, obtido da sessão com `requireActor` (`apps/backend/src/shared/http/actor-from-jwt.ts`). Não repasse o objeto do usuário da sessão nem verifique tipo ou permissão no controller: a autorização de negócio fica no caso de uso, pela porta `AuthProvider` do módulo.
- Converta parâmetros de rota, filtros e corpo HTTP nos tipos declarados pelo contrato da operação antes de chamar o caso de uso. Encaminhe falhas ao tratamento central com `next(erro)`.
- Valide o formato de transporte no controller. Deixe valores permitidos de enums de negócio, transições de estado e outras invariantes no domínio. Reutilize o caso de uso, a entidade ou o Value Object responsável pela regra.

## Workflow

1. Confirme o módulo, o verbo, o caminho, a autenticação, a entrada, a saída e o status HTTP. Inspecione os consumidores existentes.
2. Registre a rota no construtor e implemente o método privado. Extraia apenas os campos aceitos e normalize os tipos do transporte.
3. Delegue ao caso de uso ou serviço de aplicação injetado. Preserve caminhos e respostas vigentes salvo mudança solicitada.
4. Revise exports e composição. Atualize as requisições REST Client quando o módulo as usar e rode os checks próximos do backend.

## References

Consulte [controller-pattern.md](references/controller-pattern.md) para caminhos, exemplo, checklist e armadilhas.

## Global Standards

Consulte [skills-standards.md](../skills-standards.md) para convenções gerais.

Use arquivos em kebab-case com sufixo `.controller.ts`, classe em PascalCase com sufixo `Controller` e métodos privados de registro em PascalCase. Siga a arquitetura do projeto consumidor e os contratos públicos do pacote proprietário.
