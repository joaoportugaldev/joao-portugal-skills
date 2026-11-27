# DTO Pattern

## Finalidade e nomes

Um DTO pode levar dados para uma operação, devolver um resultado ou representar uma projeção de leitura. Identifique a finalidade para escolher os campos. Nomeie pelo conceito, como `ProdutoDTO`, ou pela intenção, como `FiltroProdutosDTO`, seguindo a mesma convenção de nomenclatura.

## DTO principal do agregado

O DTO principal é o DTO da entidade. Ele estende as `Props` da entidade, é produzido por `Entidade.toDTO`, é o que `findById` do repositório devolve e o que os comandos de gravação recebem. O nome é o da entidade mais `DTO`, sem outra palavra.

| Entidade | DTO principal | Arquivo | Incorreto |
| --- | --- | --- | --- |
| `Produto` | `ProdutoDTO` | `produto.dto.ts` | `ProdutoEstadoDTO`, `ProdutoCompletoDTO`, `DadosProdutoDTO` |

Os demais DTOs do agregado levam o nome do conjunto de dados que transportam e nunca usam o nome puro `<Entidade>DTO`:

```ts
// produto/dto/produto.dto.ts — DTO principal: estende as props da entidade.
export interface ProdutoDTO extends ProdutoProps {}

// produto/dto/produto-listado.dto.ts — projeção da listagem: só os campos da tabela.
export interface ProdutoListadoDTO {
  id: string;
  nome: string;
  nomeCategoria: string;
}
```

## Modelagem do contrato

- Explicite os campos, a diferença entre ausência e `null`, e a representação de datas, valores monetários e identificadores quando relevantes.
- Para projeções ou operações específicas, use `Pick` ou `Omit` sobre tipos estáveis quando a evolução conjunta for desejada. Para contratos independentes, declare os campos explicitamente.
- Mapeie o resultado campo a campo na fronteira quando houver risco de expor dados internos. Tipos TypeScript não removem campos em tempo de execução.
- Para saída derivada diretamente de uma entidade, defina `static toDTO(entidade: Entidade): EntidadeDTO` na classe da entidade. Importe o DTO somente como tipo; a entidade não deve carregar código de adapter em tempo de execução.
- Em campos aninhados, use `OutraEntidade.toDTO` quando o contrato do campo for aquele DTO. Preserve outro formato declarado, como um objeto de propriedades, quando for o contrato vigente.
- Chame `Entidade.toDTO(entidade)` nos consumidores. Se a origem for `Props`, reconstrua a entidade apenas quando isso preservar o comportamento esperado. Quando a construção alterar ou rejeitar dados de leitura válidos, o método estático pode aceitar esse tipo de `Props` explicitamente e preservar a saída anterior; não use essa exceção para contornar validação em escrita.
- Reutilize o envelope de paginação do pacote compartilhado (`PaginatedResultDTO<T>`, com `data` e `meta`). Não declare um envelope local.
- Um arquivo `*.dto.ts` declara um único DTO. As exceções da regra de uma declaração por arquivo estão em `skills-standards.md`.

## Exemplo

`produto/dto/produto.dto.ts`

```ts
import type { ProdutoProps } from "../model/produto.entity";

export interface ProdutoDTO extends ProdutoProps {}
```

`produto/model/produto.entity.ts` (trecho)

```ts
import type { ProdutoDTO } from "../dto/produto.dto";

export interface ProdutoProps extends EntityProps {
  id: string;
  nome: string;
}

export class Produto extends Entity<Produto, ProdutoProps> {
  static toDTO(produto: Produto): ProdutoDTO {
    return { id: produto.id, nome: produto.props.nome };
  }
}
```

## Checklist

- O consumidor recebe apenas os campos necessários e os formatos esperados.
- O DTO é um contrato de dados independente de classes de entidade e tipos de ORM.
- Alterações em campos obrigatórios, nulabilidade e formato foram verificadas nos produtores e consumidores.
- O mapeamento e a serialização foram verificados com os testes mais próximos, incluindo campos calculados, datas, valores, `null` e propriedades opcionais.
- Consumidores, injeções de conversores e exports públicos foram revisados quando um conversor entidade → DTO foi removido.

## Armadilhas comuns

- Declarar dois DTOs no mesmo arquivo, ou declarar um DTO no arquivo de uma porta, serviço ou caso de uso.
- Criar um DTO de paginação próprio do agregado em vez de usar o do pacote compartilhado.
- Retornar a entidade diretamente ou espalhar suas propriedades no payload. Selecione os campos públicos em `toDTO`.
- Reutilizar o mesmo DTO para operações cujos contratos evoluem de forma independente. Modele a forma que cada consumidor precisa.
- Dar ao DTO da entidade um nome com palavra extra (`ProdutoEstadoDTO`), ou dar o nome `ProdutoDTO` a uma projeção que não estende as props da entidade.
- Acoplar a resposta pública à estrutura de armazenamento. Converta para a representação da fronteira.
