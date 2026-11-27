# Query CQRS Pattern (Genérico)

## Quando usar Query (CQRS)

- Operações de leitura: listagens, a consulta de registros ativos, a verificação de existência antes de um comando e a busca por ID de um caso de uso de leitura (`obter-cartao-por-id`).
- Exceção: carregar por ID o estado que um caso de uso vai alterar é `findById` do Repository.
- Projeções com paginação, filtros, agregações e joins.
- DTO orientado ao consumidor.

## Quando usar Repository (comando)

- Expor comandos de persistência, como `create`, `update` e `delete`, e `findById` como única leitura.
- Em um comando que precisa do estado atual, o caso de uso chama `repository.findById`, reconstrói a entidade com `tryCreate`, aplica as regras de domínio e entrega ao Repository o DTO produzido por `Entidade.toDTO`. Garantias que precisam ser atômicas devem ser verificadas na escrita.

## DTO em Query: regra de modelagem

- Não estender a classe da entidade.
- Opções válidas:
  - Derivar de `*Props` da entidade com adaptação:
    - exemplo: `interface RoleDTO extends Omit<RoleProps, "permissionIds"> { permissions: ... }`
  - Criar DTO totalmente independente quando a projeção exigir.
- Escolher a opção de menor acoplamento para o caso.

## Exemplo de mapper de leitura

Neste exemplo fictício de reservas, o mapper em `db/reserva.mapper.ts` formata a linha para a busca por ID e acrescenta o nome do cliente à saída da listagem.

```ts
interface ReservaTabela {
    id: string;
    cliente_id: string;
    inicio: Date;
    observacao: string | null;
}

interface ReservaListadaTabela extends ReservaTabela {
    cliente_nome: string | null;
}

interface ReservaDTO {
    id: string;
    clienteId: string;
    inicio: string;
    observacao?: string;
}

interface ReservaListadaDTO extends ReservaDTO {
    clienteNome: string | null;
}

class ReservaMapper {
    static toDTO(row: ReservaTabela): ReservaDTO {
        return {
            id: row.id,
            clienteId: row.cliente_id,
            inicio: row.inicio.toISOString(),
            observacao: row.observacao ?? undefined,
        };
    }

    static toListagemDTO(row: ReservaListadaTabela): ReservaListadaDTO {
        return {
            ...ReservaMapper.toDTO(row),
            clienteNome: row.cliente_nome,
        };
    }
}

// Conversões usadas pelos adaptadores de consulta após a leitura do banco.
function mapearBuscaPorId(row: ReservaTabela | null): ReservaDTO | null {
    return row === null ? null : ReservaMapper.toDTO(row);
}

function mapearItensDaPagina(rows: ReservaListadaTabela[]): ReservaListadaDTO[] {
    return rows.map(ReservaMapper.toListagemDTO);
}
```

O adaptador envolve o DTO ou a página em `Result`, mantendo contagens e paginação fora do mapper. Quando uma consulta prepara uma escrita, o caso de uso aplica os novos valores e as regras de domínio antes de persistir.

## Listagens paginadas

- Usar os contratos do pacote compartilhado, sem redeclará-los: a entrada da query (`XxxQueryIn`) estende `PaginatedInputDTO` (`page`, `pageSize`) e a query retorna `Promise<Result<PaginatedResultDTO<ItemDTO>>>` (`data` e `meta`). Preservar `meta` quando o caso de uso transformar `data`.
- Validar `page` e `pageSize` como inteiros positivos. Retornar `Result.fail` para valores inválidos.
- No adaptador, calcular o deslocamento como `(page - 1) * pageSize`. Aplicar filtros e ordenação determinística, com ID único como desempate, antes de `limit` e `offset`.
- Calcular `meta.total` com os mesmos filtros da seleção dos itens, dentro do escopo autorizado e ignorando o recorte da página. Calcular `meta.totalPages` a partir de `total` e `pageSize`.
- Para consultas operacionais que precisam processar todos os candidatos, preservar a leitura completa ou definir um processamento em lotes que percorra o conjunto inteiro.

## Contrato esperado

O pacote compartilhado define o formato comum:

```ts
export interface Query<IN, OUT> {
  execute(input: IN): Promise<Result<OUT>>;
}
```

Cada consulta do módulo estende esse contrato, em arquivo próprio:

`provider/buscar-cartao-por-id.query.ts` — usada pelo caso de uso de leitura `obter-cartao-por-id`; entrada pequena, escrita direto no contrato:

```ts
import type { Query } from "@poiesis/shared";
import type { CartaoDTO } from "../dto/cartao.dto";

export interface BuscarCartaoPorIdQuery extends Query<{ id: string }, CartaoDTO | null> {}
```

`provider/listagem-cartoes.query.ts` — a entrada tem nome próprio: o nome da query seguido de `In`, no mesmo arquivo:

```ts
import type { PaginatedInputDTO, PaginatedResultDTO, Query } from "@poiesis/shared";
import type { CartaoDTO } from "../dto/cartao.dto";

export interface ListagemCartoesQueryIn extends PaginatedInputDTO {
  bandeira?: string;
  busca?: string;
}

export interface ListagemCartoesQuery extends Query<ListagemCartoesQueryIn, PaginatedResultDTO<CartaoDTO>> {}
```

`use-case/listar-cartoes.use-case.ts` — o caso de uso declara os próprios campos de entrada e monta a entrada da query:

```ts
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, Result, type PaginatedResultDTO, type UseCase } from "@poiesis/shared";
import type { CartaoDTO } from "../dto/cartao.dto";
import type { ListagemCartoesQuery } from "../provider/listagem-cartoes.query";

export interface ListarCartoesIn {
  bandeira?: string;
  busca?: string;
  page?: number;
  pageSize?: number;
}

export type ListarCartoesOut = PaginatedResultDTO<CartaoDTO>;

export class ListarCartoesUseCase implements UseCase<ListarCartoesIn, ListarCartoesOut> {
  constructor(private readonly listagem: ListagemCartoesQuery) {}

  async execute({ bandeira, busca, page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE }: ListarCartoesIn): Promise<Result<ListarCartoesOut>> {
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
      return Result.fail("cartao.paginacao-invalida");
    }
    return this.listagem.execute({ bandeira, busca: busca?.trim() || undefined, page, pageSize });
  }
}
```

No backend, `queries/listagem-cartoes.query.knex.ts` implementa o contrato. O exemplo usa Knex; adapte ao cliente de banco do projeto. O `try`/`catch` fica aqui, no adaptador, que traduz a falha técnica em `Result`:

```ts
import { Result, type PaginatedResultDTO } from "@poiesis/shared";
import type { CartaoDTO, ListagemCartoesQuery, ListagemCartoesQueryIn } from "@namespace/pagamento/cartao";
import type { Knex } from "knex";
import { CartaoMapper } from "../db/cartao.mapper";

export class ListagemCartoesQueryKnex implements ListagemCartoesQuery {
  constructor(private readonly conexao: Knex) {}

  async execute({ bandeira, busca, page, pageSize }: ListagemCartoesQueryIn): Promise<Result<PaginatedResultDTO<CartaoDTO>>> {
    try {
      const filtrada = this.conexao("cartao").modify((consulta) => {
        if (bandeira) consulta.where("bandeira", bandeira);
        if (busca) consulta.whereILike("apelido", `%${busca}%`);
      });
      const [{ total }] = await filtrada.clone().count<{ total: string }[]>({ total: "*" });
      const linhas = await filtrada.clone().orderBy("apelido").orderBy("id").limit(pageSize).offset((page - 1) * pageSize);
      return Result.ok({
        data: linhas.map(CartaoMapper.toDTO),
        meta: { page, pageSize, total: Number(total), totalPages: Math.ceil(Number(total) / pageSize) },
      });
    } catch {
      return Result.fail("cartao.falha-ao-ler");
    }
  }
}
```

- Não redeclare `execute` na interface da consulta.
- Uma consulta tem uma única operação. Divida interfaces com vários métodos de leitura em uma `*Query` por operação.

- `InputDTO` pode ser primitivo, objeto de filtro ou paginação.
- `OutputDTO` pode ser item único, coleção paginada, painel agregado etc.

## Checklist de implementação

- [ ] A operação consulta dados, ainda que o caso de uso consumidor seja um comando.
- [ ] Interface `*Query` está em arquivo `*.query.ts` no `provider/` do submódulo. O arquivo declara só a query e, quando houver, o tipo de entrada dela, chamado `<NomeDaQuery>In`.
- [ ] A saída da query está em `dto/`, em arquivo `*.dto.ts` próprio.
- [ ] `execute` retorna `Promise<Result<DTO>>`.
- [ ] DTO está alinhado com necessidade do consumidor.
- [ ] Use case de leitura mapeia `isFailure` para erro de domínio quando necessário.
- [ ] Adapter de infraestrutura implementa a interface sem vazar detalhes do banco.

## Estratégia de testes

- Query/use case retorna dados esperados em cenário feliz.
- Cenário de vazio/not found.
- Cenário de falha da query (erro técnico ou dados inexistentes).
- Listagem paginada com valores padrão, filtros combinados, totais, ordem estável entre páginas, página vazia e parâmetros inválidos.
- Se houver formatação adicional no use case (ex.: preço formatado), testar projeção final.

## Armadilhas comuns

- Expor no contrato do Repository buscas além de `findById`.
- Injetar uma Query de busca por ID em um caso de uso que já recebe o Repository da mesma entidade. O `findById` do Repository já faz essa leitura.
- Retornar uma entidade em uma Query que deve entregar DTO.
- Colocar regra de escrita numa query.
- Acoplar DTO de leitura à estrutura de banco.
- Misturar responsabilidades (query fazendo comando).
- Chamar a entrada da query de `XxxFiltroDTO` ou colocá-la em `dto/`. O nome é `<NomeDaQuery>In`, no arquivo da query.
