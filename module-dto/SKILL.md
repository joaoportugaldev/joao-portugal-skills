---
name: module-dto
description: >-
  Crie, revise ou migre Data Transfer Objects de módulo. Use quando o pedido envolver DTO, arquivos *.dto.ts, contratos de entrada ou saída de casos de uso e APIs, filtros, paginação, metadados ou mapeamento de dados para consumidores sem expor entidades ou tipos do ORM.
---

# Module DTO

## Overview

Modele os dados que atravessam fronteiras de aplicação. Defina campos, tipos e formatos a partir das necessidades do consumidor.

## Guidelines

- Leia [dto-pattern.md](references/dto-pattern.md) antes de criar ou alterar DTOs.
- Declare todo DTO em um arquivo `*.dto.ts` na pasta `dto/` diretamente dentro do módulo ou submódulo que possui o contrato.
- Declare o DTO correspondente a uma entidade sempre como `export interface EntidadeDTO extends EntidadeProps {}`, com import somente de tipo. Herde diretamente as Props usadas pela classe da entidade. Projeções, filtros e contratos de operações específicas têm DTOs próprios.
- Nomeie pelo conceito ou pela operação. Use a mesma convenção para entrada, saída e leitura.
- Mantenha o DTO como contrato de dados. Para projeção direta de uma entidade do módulo em seu DTO de saída, use `static toDTO(entidade)` na própria classe da entidade, com mapeamento explícito dos campos. Não coloque regras de domínio no DTO.
- Mantenha conversões sem entidade de origem, reconstrução DTO → entidade e traduções entre contratos externos na camada proprietária da fronteira.
- Prefira tipos dedicados para contratos públicos. Reaproveite tipos de dados estáveis quando o acoplamento for intencional.

## Workflow

1. Identifique quem produz e quem consome o DTO e quais campos a operação exige.
2. Defina nomes, tipos, campos opcionais e formatos serializados. Reutilize os contratos locais de filtros e paginação quando aplicáveis.
3. Ajuste `toDTO` na entidade quando aplicável, os consumidores e os exports afetados. Preserve os contratos existentes salvo mudança solicitada. Evite imports de runtime do DTO pela entidade.
4. Verifique o tipo e a forma serializada nos testes mais próximos, incluindo a ausência de campos internos ou sensíveis.

## References

Consulte [dto-pattern.md](references/dto-pattern.md) para exemplos, fronteiras e checklist.

## Global Standards

Consulte [skills-standards.md](../skills-standards.md) para as convenções gerais. Todo tipo ou interface que represente um DTO deve ter nome terminado em `DTO`, inclusive DTOs de integração, como `ProdutoDTO`, `FiltroProdutosDTO` e `ContextoAutorizacaoDoUsuarioDTO`. Ao renomear um contrato público existente, preserve a compatibilidade necessária para seus consumidores.
