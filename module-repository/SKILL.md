---
name: module-repository
description: 'Criar, revisar ou orientar contratos e implementações de repositório de módulo no padrão Genérico. Usar quando o pedido envolver arquivos `*.repository.ts`, comandos de persistência de entidades (create/update/delete), adaptação de infraestrutura (ex.: Prisma) para contratos de módulo, tratamento de erros com `Result`, mapeamento entre domínio e persistência ou a skill `module-repository`.'
---

# Module Repository

## Overview

Definir repositórios de módulo que exponham exclusivamente comandos de persistência de entidades de domínio e sejam implementados por adapters de infraestrutura.

## Guidelines

- Definir contrato em `modules/*/src/**/provider/*.repository.ts`, com uma única interface por arquivo. Tipos de entrada ou saída do contrato são DTOs em `dto/`.
- Reutilizar bases de shared que exponham somente os comandos necessários, como `CreateRepository`. Contratos que incluem métodos de leitura ficam fora da interface de Repository.
- Implementar em adapter de infraestrutura (ex.: `apps/backend/src/**/*.prisma.ts`) retornando `Result`.
- Extrair o mapeamento explícito de persistência para `*.mapper.ts`, junto ao adaptador de banco. Usar `static toTable(entity)` para gerar a linha de escrita.
- Implementar `static toDomainResult(row): Result<Entidade>` com `Entidade.tryCreate` quando um consumidor precisar reconstituir a entidade a partir de uma linha.
- Tratar falhas com `Result.fail(...)` e não vazar exceção no fluxo normal.
- Declarar toda leitura em um contrato `*Query` em arquivo `*.query.ts`, inclusive `findById`, `findAll` e as consultas necessárias para validar ou preparar uma escrita.
- Proteger na escrita as invariantes que exigem atomicidade, como unicidade ou atualização condicionada ao estado esperado.

## Workflow

1. Confirmar agregados/entidades cobertos pelo repositório.
2. Definir o contrato no domínio com os comandos necessários e extrair as buscas para contratos de Query.
3. Implementar adapter de infraestrutura respeitando o contrato.
4. Chamar `toTable` do mapper nos comandos que gravam a entidade.
5. Garantir consistência transacional para operações compostas.
6. Criar/ajustar mocks in-memory para testes de use case.

## References

Consultar `references/repository-pattern.md` para contratos, exemplos de implementação e checklist.
Consultar `../skills-standards.md` para convenção global de nomenclatura.

## Global Standards

- Consultar `../skills-standards.md` para padroes globais de nomenclatura e convencoes gerais entre skills.
