# Repository Pattern (Genérico)

## Regra da porta

O que atravessa a porta é dado. O comando recebe um DTO e devolve `Result<void>` ou `Result` de um DTO. A entidade não entra nem sai do repositório: o caso de uso a transforma em DTO com `Entidade.toDTO(entidade)` antes de gravar. 

O repositório pode ter uma leitura: `findById`, que devolve o DTO de estado (ou `null`). Ela pertence ao contexto de comando, porque existe para o caso de uso carregar o estado que vai validar e alterar. As demais leituras são consultas em `*.query.ts`.

| Situação | Onde fica |
| --- | --- |
| Caso de uso que altera ou exclui precisa do estado atual | `repository.findById(id)` |
| Caso de uso de leitura `obter-reserva-por-id`, que só devolve o dado | `BuscarReservaPorIdQuery` em `buscar-reserva-por-id.query.ts` |
| Listagem, filtro, projeção, verificação de existência | `*Query` própria |

Os dois caminhos podem existir ao mesmo tempo no mesmo agregado. Um caso de uso que já recebe o Repository de uma entidade usa o `findById` dele para carregá-la; não injete também uma Query por ID da mesma entidade. Um caso de uso de escrita pode receber uma Query por ID por outro motivo, como ler uma entidade cujo Repository ele não recebe. Não faça um caso de uso de leitura depender do Repository.

## Exemplo

Contrato no módulo, em `reserva/provider/reserva.repository.ts`:

```ts
import type { Result } from "@poiesis/shared";
import type { ReservaDTO } from "../dto/reserva.dto";

/** Persistência da reserva. Os comandos recebem o DTO produzido por `Reserva.toDTO`. */
export interface ReservaRepository {
  /** Carrega o estado que o caso de uso vai validar e alterar. Devolve null quando o ID não existe. */
  findById(id: string): Promise<Result<ReservaDTO | null>>;
  create(reserva: ReservaDTO): Promise<Result<void>>;
  /** Compara o status esperado na mesma escrita. Falha se a reserva mudou ou sumiu. */
  update(reserva: ReservaDTO, esperado: Pick<ReservaDTO, "status">): Promise<Result<void>>;
  /** Retorna false quando o registro já não existe. */
  delete(id: string): Promise<Result<boolean>>;
}
```

Mapper no backend, em `db/reserva.mapper.ts`. Só converte dados; não monta entidade:

```ts
import type { ReservaDTO } from "@namespace/hospedagem/reserva";
import type { ReservaTabela } from "../types/reserva.types";

export class ReservaMapper {
  static toTable(reserva: ReservaDTO): ReservaTabela {
    return {
      id: reserva.id,
      cliente_id: reserva.clienteId,
      inicio: new Date(reserva.inicio),
      status: reserva.status,
      observacao: reserva.observacao ?? null,
    };
  }

  static toDTO(row: ReservaTabela): ReservaDTO {
    return {
      id: row.id,
      clienteId: row.cliente_id,
      inicio: row.inicio.toISOString(),
      status: row.status,
      observacao: row.observacao ?? undefined,
    };
  }
}
```

Adaptador, em `db/reserva.repository.knex.ts`. O exemplo usa Knex; adapte ao cliente de banco do projeto:

```ts
import { Result } from "@poiesis/shared";
import type { ReservaDTO, ReservaRepository } from "@namespace/hospedagem/reserva";
import type { Knex } from "knex";
import type { ReservaTabela } from "../types/reserva.types";
import { ReservaMapper } from "./reserva.mapper";

export class ReservaRepositoryKnex implements ReservaRepository {
  constructor(private readonly conexao: Knex) {}

  async findById(id: string): Promise<Result<ReservaDTO | null>> {
    try {
      const row = await this.conexao<ReservaTabela>("reserva").where("id", id).first();
      return Result.ok(row ? ReservaMapper.toDTO(row) : null);
    } catch {
      return Result.fail("reserva.falha-ao-buscar-por-id");
    }
  }

  async create(reserva: ReservaDTO): Promise<Result<void>> {
    try {
      await this.conexao<ReservaTabela>("reserva").insert(ReservaMapper.toTable(reserva));
      return Result.ok();
    } catch {
      return Result.fail("reserva.falha-ao-criar");
    }
  }

  async update(reserva: ReservaDTO, esperado: Pick<ReservaDTO, "status">): Promise<Result<void>> {
    try {
      const atualizados = await this.conexao<ReservaTabela>("reserva")
        .where({ id: reserva.id, status: esperado.status })
        .update(ReservaMapper.toTable(reserva));
      return atualizados === 0 ? Result.fail("reserva.alteracao-concorrente") : Result.ok();
    } catch {
      return Result.fail("reserva.falha-ao-atualizar");
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      const excluidos = await this.conexao<ReservaTabela>("reserva").where("id", id).delete();
      return Result.ok(excluidos > 0);
    } catch {
      return Result.fail("reserva.falha-ao-excluir");
    }
  }
}
```

Uso no caso de uso de escrita: carrega o estado com `findById`, reconstrói a entidade, aplica a regra e grava o DTO que a entidade produz.

```ts
const encontrada = await this.repository.findById(id);
if (encontrada.isFailure) return encontrada.withFail;
if (!encontrada.instance) return Result.fail("reserva.nao-encontrada");

const reserva = Reserva.tryCreate(encontrada.instance);
if (reserva.isFailure) return reserva.withFail;
const cancelada = reserva.instance.cancelar();
if (cancelada.isFailure) return cancelada.withFail;

const salva = await this.repository.update(Reserva.toDTO(cancelada.instance), { status: reserva.instance.status });
if (salva.isFailure) return salva.withFail;
return Result.ok(Reserva.toDTO(cancelada.instance));
```

## Papel do Repository

- Encapsular a persistência do estado do agregado, recebido como DTO.
- Expor comandos orientados ao agregado, como `create`, `update`, `delete` e comandos específicos do domínio, e `findById` quando um caso de uso precisa carregar o estado para alterá-lo.
- Não conter regra de caso de uso.

## Repository vs Query (CQRS)

- Repository expõe comandos e `findById`. O adapter pode ler dados internamente ao executar um comando para garantir a consistência da escrita.
- Query expõe as demais leituras por um contrato próprio em arquivo `*.query.ts`, inclusive a busca por ID de um caso de uso de leitura. Os contratos podem compartilhar infraestrutura, como o mapper.

## Estrutura esperada

1. Definir interface de repositório no `dominio`.
2. Reutilizar bases compartilhadas que exponham somente os métodos necessários. `CrudRepository<T>` também expõe leituras além de `findById`.
3. Adicionar métodos específicos de domínio apenas quando necessários.
4. Implementar adapter (banco ou in-memory) retornando `Result<void>` ou `Result` de DTO.
5. Gerar a linha com `toTable(dto)` no `*.mapper.ts`.

## Checklist de implementação

- [ ] Contrato está em `dominio` e tipa `Promise<Result<...>>`.
- [ ] Implementação não vaza tipo de ORM para o dominio.
- [ ] Erro de not found mapeado para erro de domínio.
- [ ] Operações compostas usam transação quando necessário.
- [ ] O contrato expõe comandos e, no máximo, `findById` como leitura. As demais buscas estão em contratos `*.query.ts`.
- [ ] `findById` devolve `Result` do DTO principal (`ReservaDTO`, o nome da entidade mais `DTO`) ou `null`, nunca a entidade.
- [ ] O DTO principal estende as props da entidade e não tem outra palavra no nome (`ReservaEstadoDTO` é incorreto).
- [ ] Comandos específicos têm nomes orientados ao domínio, como `updateRoles`.
- [ ] Mocks de teste seguem contrato real.

## Estratégia de testes

- Testar sucesso/falha dos métodos principais.
- Testar not found.
- Testar métodos específicos de domínio.
- Em mocks/in-memory, garantir comportamento consistente com contrato.

## Armadilhas comuns

- Expor no Repository buscas além de `findById`, inclusive por herança de contratos que incluem métodos de leitura.
- Injetar uma Query de busca por ID em um caso de uso que já recebe o Repository da mesma entidade, ou usar o Repository em um caso de uso de leitura.
- Receber ou devolver a entidade em um método do contrato. A porta troca só DTO.
- Criar `toDomain` no mapper ou montar entidade no adaptador.
- Gravar um DTO montado à mão no caso de uso, em vez do produzido por `Entidade.toDTO`.
- Depender apenas de uma consulta prévia para garantir uma invariante sujeita a concorrência.
- Acoplar use case ao ORM em vez da interface.
- Não normalizar dados ao mapear domínio.
- Esquecer transação em operações que alteram múltiplas tabelas.
