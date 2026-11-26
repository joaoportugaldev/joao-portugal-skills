# Repository Pattern (Genérico)

## Exemplo de mapper de persistência

Neste exemplo fictício de reservas, `db/reserva.mapper.ts` concentra as conversões. As declarações representam os contratos do domínio e do adaptador de banco.

```ts
type Result<T> = { isOk: true; instance: T } | { isOk: false; errors: string[] };

interface ReservaProps {
    id: string;
    clienteId: string;
    inicio: string;
    observacao?: string;
}

declare class Reserva implements ReservaProps {
    readonly id: string;
    readonly clienteId: string;
    readonly inicio: string;
    readonly observacao?: string;
    static tryCreate(props: Omit<ReservaProps, "inicio"> & { inicio: Date | string }): Result<Reserva>;
}

interface ReservaTabela {
    id: string;
    cliente_id: string;
    inicio: Date;
    observacao: string | null;
}

class ReservaMapper {
    static toTable(reserva: Reserva): ReservaTabela {
        return {
            id: reserva.id,
            cliente_id: reserva.clienteId,
            inicio: new Date(reserva.inicio),
            observacao: reserva.observacao ?? null,
        };
    }

    static toDomainResult(row: ReservaTabela): Result<Reserva> {
        return Reserva.tryCreate({
            id: row.id,
            clienteId: row.cliente_id,
            inicio: row.inicio,
            observacao: row.observacao ?? undefined,
        });
    }
}

interface ReservaRepository {
    create(reserva: Reserva): Promise<Result<void>>;
    update(reserva: Reserva): Promise<Result<void>>;
}

interface ReservaStore {
    insert(row: ReservaTabela): Promise<Result<void>>;
    update(id: string, row: ReservaTabela): Promise<Result<void>>;
}

class ReservaRepositoryAdapter implements ReservaRepository {
    constructor(private readonly store: ReservaStore) {}

    create(reserva: Reserva): Promise<Result<void>> {
        return this.store.insert(ReservaMapper.toTable(reserva));
    }

    update(reserva: Reserva): Promise<Result<void>> {
        return this.store.update(reserva.id, ReservaMapper.toTable(reserva));
    }
}
```

Inclua `toDomainResult` quando um consumidor precisar reconstituir a entidade. Encaminhe o resultado de `tryCreate`, preserve os metadados existentes e converta `null` em `undefined` quando o campo for opcional no domínio.

## Papel do Repository

- Encapsular persistência de entidades de domínio.
- Expor somente comandos orientados ao agregado, como `create`, `update`, `delete` e comandos específicos do domínio.
- Não conter regra de caso de uso.

## Repository vs Query (CQRS)

- Repository expõe comandos. O adapter pode ler dados internamente ao executar um comando para garantir a consistência da escrita.
- Query expõe leituras por um contrato próprio em arquivo `*.query.ts`, inclusive buscas usadas por casos de uso de escrita. Os contratos podem compartilhar infraestrutura.

## Estrutura esperada

1. Definir interface de repositório no `dominio`.
2. Reutilizar bases compartilhadas que exponham somente os comandos necessários. `CrudRepository<T>` também expõe leituras.
3. Adicionar métodos específicos de domínio apenas quando necessários.
4. Implementar adapter (Prisma/in-memory) retornando `Result`.
5. Quando houver conversão para a representação de persistência, gerar a linha com `toTable(entity)` no `*.mapper.ts`.

## Checklist de implementação

- [ ] Contrato está em `dominio` e tipa `Promise<Result<...>>`.
- [ ] Implementação não vaza tipo de ORM para o dominio.
- [ ] Erro de not found mapeado para erro de domínio.
- [ ] Operações compostas usam transação quando necessário.
- [ ] O contrato expõe somente comandos. As buscas estão em contratos `*.query.ts`.
- [ ] Comandos específicos têm nomes orientados ao domínio, como `updateRoles`.
- [ ] Mocks de teste seguem contrato real.

## Estratégia de testes

- Testar sucesso/falha dos métodos principais.
- Testar not found.
- Testar métodos específicos de domínio.
- Em mocks/in-memory, garantir comportamento consistente com contrato.

## Armadilhas comuns

- Expor buscas no Repository, inclusive por herança de contratos que incluem métodos de leitura.
- Depender apenas de uma consulta prévia para garantir uma invariante sujeita a concorrência.
- Acoplar use case ao ORM em vez da interface.
- Não normalizar dados ao mapear domínio.
- Esquecer transação em operações que alteram múltiplas tabelas.
