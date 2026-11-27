---
name: module-query-cqrs
description: Criar, revisar ou orientar queries de módulo no padrão CQRS de leitura no Genérico. Usar quando o pedido envolver interfaces `*Query`, arquivos `*.query.ts`, use cases de leitura (`find-*`), projeções/DTOs para consumo da API/front, paginação/filtros/agregações, separação entre leitura (query) e escrita (repository/comando) ou a skill `module-query-cqrs`.
---

# Module Query CQRS

## Overview

Separar consultas de comandos e retornar DTOs adequados ao consumidor, inclusive quando o consumidor é um caso de uso de escrita.

## Guidelines

- Declarar toda operação de leitura em `modules/<domain>/src/<feature>/provider/*.query.ts`, com interface `*Query` e método `execute(...) => Promise<Result<DTO>>`. Isso inclui buscas por ID, listagens, verificações de existência e leituras de estado antes de uma escrita.
- Reservar o contrato do Repository a comandos como `create`, `update` e `delete`. Em um caso de uso de escrita, injetar a Query para obter o estado e o Repository para persistir a alteração.
- Implementar query no adapter de infraestrutura (ex.: Prisma) retornando DTO.
- Extrair a conversão de linhas em DTOs para métodos estáticos de `*.mapper.ts`. Compartilhar o mapper com o repositório da mesma funcionalidade quando ambos mapearem a mesma tabela.
- Declarar cada consulta estendendo `Query<IN, OUT>` do pacote compartilhado, sem redeclarar a assinatura de `execute`: `export interface CartoesPaginadosQuery extends Query<PaginatedInputDTO, PaginatedResultDTO<CartaoDTO>> {}`. Cada consulta tem uma única operação; uma interface com vários métodos de leitura (`obterPorId`, `obterVarios`) deve ser dividida em uma `*Query` por operação.
- Declarar uma única interface `*Query` por arquivo. A entrada da query (seu filtro) é declarada nesse mesmo arquivo, com nome terminado em `DTO`. A saída é sempre um DTO em `dto/`, em arquivo próprio.
- Nas listagens paginadas, usar `PaginatedInputDTO`, `PaginatedResultDTO<T>` e `PaginationMetaDTO` do pacote compartilhado, sem redeclará-los nem criar DTO de página local. Seguir o padrão de filtros, contagens e ordenação descrito na referência.
- Manter use case de leitura fino: chamar query, mapear falhas e aplicar formatação complementar quando necessário.
- Não acoplar query a regras de domínio de escrita.
- DTO de query:
  - pode derivar de `*Props` (ex.: `UserProps`, `RoleProps`) com `Omit`/campos adicionais;
  - ou ser DTO totalmente independente, conforme necessidade da projeção.
  - não estender a classe da entidade.

## Workflow

1. Identificar quais operações consultam dados e quais persistem alterações, inclusive quando ocorrem no mesmo caso de uso.
2. Definir contrato da query (`FindXxxQuery`) e DTO de saída.
3. Implementar query no adapter (Prisma/in-memory), incluindo filtros/paginação quando aplicável.
4. Injetar a query no caso de uso consumidor e propagar suas falhas. Se o fluxo alterar uma entidade, aplicar as regras de domínio antes de persistir via Repository.
5. Validar o DTO para o consumidor, incluindo os campos necessários para reconstituir a entidade quando aplicável.
6. Criar testes cobrindo sucesso, vazio/not found e falhas.

## References

Consultar `references/query-cqrs-pattern.md` para exemplos de mapeamento, checklist e critérios de modelagem de DTO.
Consultar `../skills-standards.md` para convenção global de nomenclatura.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
