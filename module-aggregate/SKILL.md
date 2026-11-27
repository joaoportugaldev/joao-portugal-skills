---
name: module-aggregate
description: >-
  Gere a estrutura inicial de um agregado DDD em um pacote de domínio existente. Use quando o pedido envolver scaffold de agregado em modules/<pacote>, geração de entidade, DTO, repositório e casos de uso, ou os modos crud e example.
---

# Module Aggregate

Use `scripts/create-aggregate.js` para gerar a estrutura inicial em `modules/<pacote>`. Use o vocabulário do domínio para nomear o agregado.

## Entradas

- Pacote existente com `src/index.ts`.
- Nome do agregado.
- Modo `crud` ou `example`. Se faltar, pergunte se o usuário quer CRUD ou um exemplo mínimo antes de executar.

## Workflow

1. Leia o contexto do domínio e confirme o pacote, o nome, o modo e a ausência de um agregado equivalente.
2. Execute na raiz do projeto.

```bash
node .agents/skills/module-aggregate/scripts/create-aggregate.js --module ordens-servico --aggregate area-operacional --mode example
```

3. Confira a estrutura criada, os exports existentes e os testes gerados. Rode os testes do pacote com foco no novo agregado.

## Estrutura gerada

- `src/<agregado>/model/<agregado>.entity.ts` usa `Entidade` do pacote compartilhado.
- `src/<agregado>/dto/<agregado>.dto.ts` declara `interface <Agregado>DTO extends <Agregado>Props {}`, com import somente de tipo.
- `src/<agregado>/provider/<agregado>.repository.ts` declara a porta.
- `src/<agregado>/usecases/*.usecase.ts` usa `CasoDeUso` e `executar`.
- `test/<agregado>/*.usecase.test.ts` usa o repositório em memória de `test/<agregado>/mock/`.
- Os barrels locais expõem os símbolos aos consumidores internos. O `src/index.ts` do pacote acrescenta o export do DTO pelo barrel do agregado e preserva os exports existentes.

## Modos

- `example` gera criar e seu teste.
- `crud` gera criar, atualizar, excluir e obter por ID, com um teste para cada operação.

## Convenções e limites

- Use arquivos em kebab-case, classes em PascalCase e nomes de operação em português.
- O DTO correspondente à entidade principal do agregado herda diretamente de suas Props, sem redeclarar ou acrescentar propriedades. Declare `<Agregado>Props extends EntidadeProps` na entidade e use esse tipo na base `Entidade`. Contratos de projeções ou operações específicas podem ter DTOs próprios.
- O nome do pacote compartilhado vem de `packages/shared/package.json`.
- O gerador recusa um pacote sem `src/index.ts`, um agregado existente ou um modo ausente.
- A estrutura contém apenas a identidade e operações ilustrativas. Regras de negócio, permissões, adaptadores e migrations pertencem à implementação solicitada.

## Recursos internos

- `scripts/create-aggregate.js` lê os templates e gera os arquivos.
- `assets/common/` contém DTO, entidade, porta, barrels e repositório em memória.
- `assets/use-case/{crud,example}/` e `assets/test/{crud,example}/` contêm os templates por modo.
