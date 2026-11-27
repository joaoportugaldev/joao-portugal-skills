---
name: module-repository
description: 'Criar, revisar ou orientar contratos e implementações de repositório de módulo no padrão Genérico. Usar quando o pedido envolver arquivos `*.repository.ts`, comandos de persistência (create/update/delete), adaptação de infraestrutura (ORM ou cliente de banco) para contratos de módulo, tratamento de erros com `Result`, mapeamento entre domínio e persistência ou a skill `module-repository`.'
---

# Module Repository

## Overview

Definir repositórios de módulo que exponham os comandos de persistência e, quando necessário, `findById`, recebam e devolvam somente dados (DTO) e sejam implementados por adapters de infraestrutura.

## Guidelines

- Definir contrato em `modules/*/src/**/provider/*.repository.ts`, com uma única interface por arquivo. Tipos de entrada ou saída do contrato são DTOs em `dto/`.
- Reutilizar bases de shared que exponham somente os métodos necessários, como `CreateRepository`. Não herdar de bases que trazem leituras além de `findById`.
- Implementar em adapter de infraestrutura, em arquivo `<nome>.repository.<tecnologia>.ts` (ex.: `pedido.repository.knex.ts`), retornando `Result`.
- O que atravessa a porta é dado. Os comandos recebem um DTO e devolvem `Result<void>` ou o `Result` de um DTO; nenhum método recebe ou devolve a entidade. Quando o caso de uso precisa da entidade, ele carrega o estado com `findById` e a reconstrói com `Entidade.tryCreate(dto)`.
- O DTO entregue a um comando de gravação é sempre produzido pela entidade (`Entidade.toDTO(entidade)`), nunca um objeto montado à mão no caso de uso.
- Extrair o mapeamento explícito de persistência para `*.mapper.ts`, junto ao adaptador de banco. Usar `static toTable(dto)` para gerar a linha de escrita e `static toDTO(row)` para a leitura.
- Não criar `toDomain`/`toDomainResult` no mapper: o adaptador não monta entidades.
- Tratar falhas com `Result.fail(...)` e não vazar exceção no fluxo normal.
- `findById(id)` é a única leitura permitida no contrato. Ela devolve `Result` do DTO principal do agregado (`<Entidade>DTO`, que estende as props da entidade) ou `null` e serve ao contexto de comando: o caso de uso que altera o agregado a usa para carregar o estado que vai validar e alterar.
- Declarar as demais leituras (`findAll`, listagens, filtros, projeções, verificações de existência) em contratos `*Query` em arquivos `*.query.ts`.
- A Query de busca por ID (`buscar-xxx-por-id.query.ts`) atende o contexto de leitura, como um caso de uso `obter-xxx-por-id`. Caso de uso de leitura não depende do Repository.
- Um caso de uso que já recebe o Repository de uma entidade carrega essa entidade com o `findById` dele; não injetar também uma Query por ID da mesma entidade. Um caso de uso de escrita pode receber uma Query por ID por outro motivo, como ler uma entidade cujo Repository ele não recebe.
- Proteger na escrita as invariantes que exigem atomicidade, como unicidade ou atualização condicionada ao estado esperado.

## Workflow

1. Confirmar os agregados cobertos pelo repositório e o DTO de estado de cada um.
2. Definir o contrato no domínio com os comandos necessários e, se algum caso de uso altera um registro existente, `findById`. Extrair as demais buscas para contratos de Query.
3. Implementar adapter de infraestrutura respeitando o contrato.
4. Chamar `toTable` do mapper nos comandos de gravação.
5. Garantir consistência transacional para operações compostas.
6. Criar/ajustar mocks in-memory para testes de use case.

## References

Consultar `references/repository-pattern.md` para contratos, exemplos de implementação e checklist.
Consultar `../skills-standards.md` para convenção global de nomenclatura.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
