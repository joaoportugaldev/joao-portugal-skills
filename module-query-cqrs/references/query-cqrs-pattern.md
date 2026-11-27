# Query CQRS Pattern (Genérico)

## Quando usar Query (CQRS)

- Toda operação de leitura, inclusive a busca por ID, a consulta de registros ativos e a verificação de existência antes de um comando.
- Projeções com paginação, filtros, agregações e joins.
- DTO orientado ao consumidor. Para preparar uma escrita, incluir os campos necessários para reconstituir a entidade e verificar precondições.

## Quando usar Repository (comando)

- Expor exclusivamente comandos de persistência, como `create`, `update` e `delete`.
- Em um comando que precisa do estado atual, o caso de uso chama a Query, aplica as regras de domínio com a entidade e chama o Repository para persistir. Garantias que precisam ser atômicas devem ser verificadas na escrita.

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

- Usar os contratos do pacote compartilhado, sem redeclará-los: o DTO de filtro estende `PaginatedInputDTO` (`page`, `pageSize`) e a query retorna `Promise<Result<PaginatedResultDTO<ItemDTO>>>` (`data` e `meta`). Preservar `meta` quando o caso de uso transformar `data`.
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

```ts
// provider/cartoes-paginados.query.ts
export interface CartoesPaginadosQuery extends Query<PaginatedInputDTO, PaginatedResultDTO<CartaoDTO>> {}

// provider/nome-cartao-em-uso.query.ts — a entrada da query fica no arquivo da query
export interface NomeCartaoEmUsoDTO {
  name: string;
  ignoreId?: string;
}

export interface NomeCartaoEmUsoQuery extends Query<NomeCartaoEmUsoDTO, boolean> {}
```

- Não redeclare `execute` na interface da consulta.
- Uma consulta tem uma única operação. Divida interfaces com vários métodos de leitura em uma `*Query` por operação.

- `InputDTO` pode ser primitivo, objeto de filtro ou paginação.
- `OutputDTO` pode ser item único, coleção paginada, painel agregado etc.

## Checklist de implementação

- [ ] A operação consulta dados, ainda que o caso de uso consumidor seja um comando.
- [ ] Interface `*Query` está em arquivo `*.query.ts` no `provider/` do submódulo. O arquivo declara só a query e, quando houver, o tipo de entrada dela.
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

- Expor buscas no contrato do Repository por serem usadas antes da escrita.
- Retornar uma entidade em uma Query que deve entregar DTO.
- Colocar regra de escrita numa query.
- Acoplar DTO de leitura à estrutura de banco.
- Misturar responsabilidades (query fazendo comando).
