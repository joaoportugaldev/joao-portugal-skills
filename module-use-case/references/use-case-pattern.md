# Use Case Pattern (Genérico)

## Paths

- Contrato base: `packages/shared/src/base/use-case.ts`
- Use cases (exemplos):
  - `modules/product/src/product/use-case/create-product.use-case.ts`
  - `modules/product/src/product/use-case/update-product.use-case.ts`
  - `modules/auth/src/user/use-case/update-user.use-case.ts`
  - `modules/auth/src/user/use-case/login.use-case.ts`
  - `modules/stock/src/movement/use-case/create-movement-out.use-case.ts`
  - `modules/auth/src/user/use-case/get-auth-dashboard-overview.use-case.ts`
- Testes (exemplos):
  - `modules/branch/test/branch/create-branch.test.ts`
  - `modules/stock/test/movement/create-movement-in.test.ts`
  - `modules/stock/test/snapshot/get-stock-quantity.use-case.test.ts`
  - `modules/product/test/category/category.use-case.test.ts`

## Estrutura esperada

1. Definir `XxxIn` (e `XxxOut` quando necessário).
2. Declarar classe `XxxUseCase implements UseCase<XxxIn, XxxOut>`.
3. Injetar dependências via construtor (`Repository`, `Query`, `Checker`, `Provider`).
4. Implementar `execute(data)` retornando `Promise<Result<...>>`.
5. Aplicar validações de fluxo com retorno antecipado em falha.
6. Delegar invariantes de domínio para entidade/VO (`tryCreate`, `cloneWith`).
7. Retornar resultado de provider/repo ou `Result.ok(...)` com DTO/agregado final.

## Padrões do caso de uso

- Use case orquestra, não persiste diretamente.
- Falhas são códigos no formato `entidade.motivo` (`pedido.nao-encontrado`), devolvidos com `Result.fail`. O fluxo usa retorno antecipado: `if (x.isFailure) return x.withFail;`.
- Leitura e escrita usam portas diferentes:
  - Caso de uso de leitura (`obter-pedido-por-id`, listagens): `Query`, que devolve DTO. Não depende do `Repository`.
  - Caso de uso de escrita: `Repository`. `findById` carrega o estado (DTO) e os comandos recebem o DTO produzido pela entidade já validada (`Entidade.toDTO(entidade)`). Outras leituras de que ele precise (existência, registros ativos) são `Query`.
- Em uma alteração:
  - Carregar o estado atual com `repository.findById`.
  - Reconstruir a entidade com `Entidade.tryCreate(dto)`.
  - Aplicar a regra pelo método de domínio da entidade ou por `cloneWith`.
  - Persistir com o `Repository`, entregando `Entidade.toDTO(...)`, e devolver esse mesmo DTO. Nenhuma porta recebe ou devolve a entidade.
- Sem `try`/`catch`. Uma etapa que precisa capturar exceção inesperada vai para um método privado chamado por `Result.tryAsync`.

## Autorização

Quando a operação depende de quem chama, o use case recebe o ator na entrada e autoriza antes de qualquer leitura ou efeito. O Auth responde fatos pela porta `AuthProvider` do módulo; o use case decide a política.

- `Actor` vem do pacote compartilhado e é obrigatório: `{ kind: "user", id, type }` ou `{ kind: "system", name }`.
- A porta fica em `modules/<modulo>/src/app/provider/auth.provider.ts` e declara somente os métodos que o módulo usa. Os códigos de permissão e de tipo de usuário são declarados pelo próprio módulo.
- Uma resposta `false` é negação; um `Result` de falha significa que não foi possível verificar e é devolvido como falha, sem virar negação.
- Não comparar `actor.type` com um valor nem herdar de um caso de uso base que embute o tipo de usuário.

```ts
export interface CancelarPedidoIn {
  actor: Actor;
  id: string;
}

export class CancelarPedidoUseCase implements UseCase<CancelarPedidoIn, PedidoDTO> {
  constructor(
    private readonly repository: PedidoRepository,
    private readonly auth: Pick<AuthProvider, "userHasType">,
  ) {}

  async execute({ actor, id }: CancelarPedidoIn): Promise<Result<PedidoDTO>> {
    const autorizado = PedidoAccessService.resolve(
      await this.auth.userHasType({ actor, types: PedidoAccessService.MANAGER_TYPES }),
    );
    if (autorizado.isFailure) return autorizado.withFail;

    // ... fluxo do caso de uso (ver "Exemplo completo")
  }
}
```

## Resultado que exige uma ação de quem chama

Quando a operação não pode prosseguir sem uma decisão de quem chama, e essa decisão depende de dados, o use case devolve sucesso com um desfecho explícito. `Result.fail` fica para falhas, que carregam apenas códigos.

```ts
export interface FecharPedidoIn {
  actor: Actor;
  id: string;
  itensSemEstoqueConfirmadosIds?: string[];
}

export type FecharPedidoOut =
  | { status: "FECHADO"; pedido: PedidoDTO }
  | { status: "CONFIRMACAO_ITENS_SEM_ESTOQUE_REQUERIDA"; itensSemEstoqueIds: string[] };

export class FecharPedidoUseCase implements UseCase<FecharPedidoIn, FecharPedidoOut> {
  async execute(data: FecharPedidoIn): Promise<Result<FecharPedidoOut>> {
    // ... autoriza, lê o pedido e consulta o estoque
    const avaliacao = ItensSemEstoqueService.avaliar({
      pedido,
      itensDisponiveisIds,
      itensSemEstoqueConfirmadosIds: data.itensSemEstoqueConfirmadosIds,
    });
    if (avaliacao.instance.exigeConfirmacao) {
      // Quem chama precisa dos IDs para confirmar: é sucesso com desfecho, não falha.
      return Result.ok({
        status: "CONFIRMACAO_ITENS_SEM_ESTOQUE_REQUERIDA",
        itensSemEstoqueIds: avaliacao.instance.itensSemEstoqueIds,
      });
    }
    // ... fecha e persiste
    return Result.ok({ status: "FECHADO", pedido: Pedido.toDTO(fechado.instance) });
  }
}
```

O controller responde com status de sucesso e o desfecho no corpo. O cliente lê `status` para decidir o próximo passo.

## Checklist de implementação

- Autorização (quando aplicável):
  - `actor` em `IN` e verificação pelo `AuthProvider` no início do `execute`.
  - Testes de negação, de ator de sistema e de falha da consulta.

- Contrato:
  - `UseCase<IN, OUT>` implementado corretamente.
  - `execute` com assinatura assíncrona e retorno `Result`.
  - `IN` usa os tipos esperados, como `id: string`, `pagina?: number` e `tamanhoPagina?: number`. Para status, usar o tipo que representa o contrato da operação.
  - O controller converte os valores HTTP antes de chamar `execute`. A validação de formato de UUID, valores de status aceitos e limites de paginação segue as regras do módulo.
- Dependências:
  - Tipadas por interfaces (não acoplar em infraestrutura concreta).
  - Injetadas no construtor.
- Erros:
  - Tratar falha de cada dependência de forma explícita.
  - Propagar `withFail` quando já estiver no formato esperado.
- Domínio:
  - Criar/atualizar entidades com `tryCreate` ou `cloneWith`.
  - Evitar colocar regra de entidade dentro do use case.
- Persistência/leitura:
  - Usar `repo/query` apenas para acesso a dados.
  - Em leitura para API/front, priorizar `Query` com DTO de saída.
  - Em escrita, carregar o estado com `repository.findById`, reconstruir a entidade com `tryCreate` e salvar com `Repository`, entregando `Entidade.toDTO(entidade)`.

## Estratégia de testes

- Cenário feliz completo.
- Pré-condições inválidas (quantidade <= 0, input ausente, etc.).
- Falhas de dependência (repo/query retornando `isFailure`).
- Comportamento condicional (com snapshot/sem snapshot, item existente/inexistente).
- Efeito colateral esperado (criação em repositório mock, update chamado com entidade válida).

## Armadilhas comuns

- Misturar lógica de validação de entidade no use case sem reutilizar `tryCreate`.
- Não mapear falhas de dependências para erro de domínio quando necessário.
- Atualizar parcialmente sem preservar `props` existentes.
- Retornar exceção em vez de `Result.fail` dentro do fluxo normal.
- Escrever `try`/`catch` no use case para engolir exceção de uma porta. As portas devolvem `Result`; quando for preciso capturar, usar `Result.tryAsync` em um método privado.
- Deixar no arquivo de constantes um código de falha que nenhum fluxo emite mais.
- Criar uma classe de erro do agregado (`class XxxError extends Error`) ou funções próprias que embrulham código baseado em exceções para devolver `Result`. Em refatoração, reescrever o fluxo com `Result`; não embrulhar o código antigo.
- Declarar no arquivo do use case tipos além de `XxxIn` e `XxxOut`.
- Extrair os campos comuns de dois `XxxIn` para uma interface ou DTO compartilhado. Cada `XxxIn` repete os campos de que precisa.

## Exemplo mínimo

`pedido/use-case/criar-pedido.use-case.ts`

```ts
import { Result, type UseCase } from "@poiesis/shared";
import type { PedidoDTO } from "../dto/pedido.dto";
import { Pedido } from "../model/pedido.entity";
import type { PedidoRepository } from "../provider/pedido.repository";

export interface CriarPedidoIn {
  clienteId: string;
  itens: { produtoId: string; quantidade: number }[];
}

export class CriarPedidoUseCase implements UseCase<CriarPedidoIn, PedidoDTO> {
  constructor(private readonly repository: PedidoRepository) {}

  async execute({ clienteId, itens }: CriarPedidoIn): Promise<Result<PedidoDTO>> {
    const pedido = Pedido.tryCreate({ clienteId, itens, status: "ABERTO" });
    if (pedido.isFailure) return pedido.withFail;

    // A porta recebe dado: o DTO sai da entidade, nunca de um objeto montado à mão.
    const dto = Pedido.toDTO(pedido.instance);
    const salvo = await this.repository.create(dto);
    if (salvo.isFailure) return salvo.withFail;
    return Result.ok(dto);
  }
}
```

## Exemplo completo: autorização, carga do estado e escrita por Repository

`pedido/use-case/cancelar-pedido.use-case.ts`

```ts
import { Result, type Actor, type UseCase } from "@poiesis/shared";
import type { AuthProvider } from "../../app/provider/auth.provider";
import type { PedidoDTO } from "../dto/pedido.dto";
import { Pedido } from "../model/pedido.entity";
import type { PedidoRepository } from "../provider/pedido.repository";
import { PedidoAccessService } from "../service/pedido-access.service";

export interface CancelarPedidoIn {
  actor: Actor;
  id: string;
  motivo: string;
}

export class CancelarPedidoUseCase implements UseCase<CancelarPedidoIn, PedidoDTO> {
  constructor(
    private readonly repository: PedidoRepository,
    private readonly auth: Pick<AuthProvider, "userHasType">,
  ) {}

  async execute({ actor, id, motivo }: CancelarPedidoIn): Promise<Result<PedidoDTO>> {
    // 1. Autoriza antes de qualquer leitura.
    const autorizado = PedidoAccessService.resolve(
      await this.auth.userHasType({ actor, types: PedidoAccessService.MANAGER_TYPES }),
    );
    if (autorizado.isFailure) return autorizado.withFail;

    // 2. Carrega o estado (DTO) pelo repositório e reconstrói a entidade.
    const encontrado = await this.repository.findById(id);
    if (encontrado.isFailure) return encontrado.withFail;
    if (!encontrado.instance) return Result.fail("pedido.nao-encontrado");
    const pedido = Pedido.tryCreate(encontrado.instance);
    if (pedido.isFailure) return pedido.withFail;

    // 3. A regra de estado mora na entidade e devolve Result.
    const cancelado = pedido.instance.cancelar(motivo);
    if (cancelado.isFailure) return cancelado.withFail;

    // 4. Persiste o DTO produzido pela entidade e o devolve.
    const dto = Pedido.toDTO(cancelado.instance);
    const salvo = await this.repository.update(dto);
    if (salvo.isFailure) return salvo.withFail;
    return Result.ok(dto);
  }
}
```

## Exemplo: etapa que não pode deixar escapar uma exceção

Depois que o provedor de pagamento aceitou a cobrança, uma exceção inesperada não pode fazer o sistema esquecer esse aceite. A etapa vai para um método privado chamado por `Result.tryAsync`, e o `execute` trata o `Result` de falha. Não há `try`/`catch` no caso de uso.

```ts
async execute({ pedidoId }: CobrarPedidoIn): Promise<Result<CobrarPedidoOut>> {
  // ... lê o pedido e cria a cobrança no provedor
  const cobrancaId = criada.instance.id;

  const confirmada = await Result.tryAsync(() => this.confirmarCobranca({ pedido, cobrancaId }));
  if (confirmada.isFailure) {
    // O aceite já aconteceu: registra a pendência para reconciliar, em vez de criar outra cobrança.
    const pendente = await this.repository.marcarCobrancaPendente({ pedidoId, cobrancaId });
    return pendente.isFailure ? pendente.withFail : Result.ok({ status: "PROCESSANDO" });
  }
  return confirmada;
}

private async confirmarCobranca({ pedido, cobrancaId }: {
  pedido: Pedido;
  cobrancaId: string;
}): Promise<Result<CobrarPedidoOut>> {
  const pago = pedido.registrarCobranca(cobrancaId);
  if (pago.isFailure) return pago.withFail;
  const salvo = await this.repository.update(Pedido.toDTO(pago.instance));
  if (salvo.isFailure) return salvo.withFail;
  return Result.ok({ status: "SUCESSO", pedido: Pedido.toDTO(pago.instance) });
}
```
