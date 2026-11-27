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
- Declare um único DTO por arquivo, com o nome do arquivo igual ao do DTO em kebab-case (`PedidoListadoDTO` em `pedido-listado.dto.ts`). Um DTO auxiliar ou derivado ganha arquivo próprio.
- Entradas, saídas e projeções usadas por portas (`*.provider.ts`, `*.query.ts`, `*.repository.ts`) são DTOs: ficam em `dto/` e a porta os importa. Não declare esses tipos no arquivo da porta, do serviço ou do caso de uso.
- Exceções: `XxxIn` e `XxxOut`, a entrada e a saída de um caso de uso, ficam no arquivo do próprio caso de uso; a entrada de uma query fica no arquivo da própria query, com o nome da query seguido de `In` (`ListagemPedidosQueryIn`), e não leva o sufixo `DTO`. A saída de uma query fica sempre em `dto/`, assim como qualquer outro tipo que o caso de uso ou a query precise.
- Não redeclare o que o pacote compartilhado já exporta. Na paginação, use `PaginatedInputDTO`, `PaginatedResultDTO<T>` e `PaginationMetaDTO`; não crie DTO de página local.
- Declare o DTO correspondente a uma entidade sempre como `export interface EntidadeDTO extends EntidadeProps {}`, com import somente de tipo. Herde diretamente as Props usadas pela classe da entidade. Projeções, filtros e contratos de operações específicas têm DTOs próprios.
- Nomeie pelo conceito ou pela operação. Use a mesma convenção para entrada, saída e leitura.
- Mantenha o DTO como contrato de dados. Para projeção direta de uma entidade do módulo em seu DTO de saída, use `static toDTO(entidade)` na própria classe da entidade, com mapeamento explícito dos campos. Não coloque regras de domínio no DTO.
- Não crie classes Converter nem injete conversores. Além de `toDTO` na entidade, a conversão fica em um método do objeto de valor, em um serviço de domínio quando a regra é compartilhada, ou no próprio caso de uso quando é pontual.
- O DTO principal do agregado é o DTO da entidade: estende as `XxxProps` da entidade, é o que `Entidade.toDTO` produz, o que `findById` devolve e o que os comandos de gravação recebem. O nome é o da entidade mais `DTO`, sem mais nada: entidade `Pedido`, DTO `PedidoDTO`, arquivo `pedido.dto.ts`. Não acrescentar palavras como `Estado`, `Completo` ou `Dados` (`PedidoEstadoDTO`). Os demais DTOs levam o nome do conjunto de dados que transportam (`PedidoListadoDTO`, `ResumoPedidoDTO`) e nunca usam o nome puro `<Entidade>DTO`.
- O que atravessa uma porta é dado: entidades e objetos de valor não são entrada nem saída de caso de uso, consulta, repositório ou provider. O DTO de estado de uma entidade tem identidade e datas de auditoria obrigatórias, porque sai da entidade ou de uma linha já gravada.
- Mantenha conversões sem entidade de origem, reconstrução DTO → entidade e traduções entre contratos externos na camada proprietária da fronteira.
- Prefira tipos dedicados para contratos públicos. Reaproveite tipos de dados estáveis quando o acoplamento for intencional.

## Workflow

1. Identifique quem produz e quem consome o DTO e quais campos a operação exige.
2. Defina nomes, tipos, campos opcionais e formatos serializados. Reutilize os contratos de paginação do pacote compartilhado.
3. Ajuste `toDTO` na entidade quando aplicável, os consumidores e os exports afetados. Preserve os contratos existentes salvo mudança solicitada. Evite imports de runtime do DTO pela entidade.
4. Verifique o tipo e a forma serializada nos testes mais próximos, incluindo a ausência de campos internos ou sensíveis.

## References

Consulte [dto-pattern.md](references/dto-pattern.md) para exemplos, fronteiras e checklist.

## Global Standards

Consulte [skills-standards.md](../skills-standards.md) para as convenções gerais. Todo tipo ou interface que represente um DTO deve ter nome terminado em `DTO`, inclusive DTOs de integração, como `ProdutoDTO`, `FiltroProdutosDTO` e `ContextoAutorizacaoDoUsuarioDTO`. Ao renomear um contrato público existente, preserve a compatibilidade necessária para seus consumidores.
