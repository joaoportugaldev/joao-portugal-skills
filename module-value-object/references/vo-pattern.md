# VO Pattern (Genérico)

## Paths

- VOs globais (shared):
  - `packages/shared/src/vo/*.vo.ts`
  - `packages/shared/test/vo/*.vo.test.ts`
- VOs de módulo (domínio):
  - `modules/<domain>/src/<feature>/model/<name>.vo.ts`
  - `modules/<domain>/test/<feature>/<name>.vo.test.ts`
- Base VO: `packages/shared/src/base/vo.ts`
- Result: `packages/shared/src/base/result.ts`

## Core Principles

- Imutabilidade: valor definido no construtor e sem setters.
- Invariantes: validar no `tryCreate` e retornar `Result.fail` quando violado.
- Normalizacao: aplicar `trim`, `toLowerCase`, formatações ou defaults quando fizer sentido.
- Erros: usar constantes estáticas cujo valor é um código `entidade.motivo` (ex.: `pedido.status-invalido`).
- API consistente: `create` -> chama `tryCreate`, `throwsIfFailed`, retorna `instance`.

## Skeleton

`pedido/model/status-pedido.vo.ts` — VO de módulo. A falha é um código `entidade.motivo` devolvido com `Result.fail`, sem `try`/`catch` nem `throw`:

```ts
import { Result, ValueObject, type ValueObjectConfig } from "@poiesis/shared";
import { StatusPedidoEnum } from "../enums/status-pedido.enum";

export class StatusPedidoVO extends ValueObject<StatusPedidoEnum, ValueObjectConfig> {
  private static readonly INVALID_STATUS = "pedido.status-invalido";

  private constructor(value: StatusPedidoEnum, config?: ValueObjectConfig) {
    super(value, config);
    Object.freeze(this);
  }

  static create(value: StatusPedidoEnum, config?: ValueObjectConfig): StatusPedidoVO {
    const result = StatusPedidoVO.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(value: unknown, config?: ValueObjectConfig): Result<StatusPedidoVO> {
    const status = Object.values(StatusPedidoEnum).find((item) => item === value);
    if (status === undefined) return Result.fail(StatusPedidoVO.INVALID_STATUS);
    return Result.ok(new StatusPedidoVO(status, config));
  }

  /** Conversão que pertence ao valor: fica no VO, não em um converter. */
  get encerrado(): boolean {
    return this.value === StatusPedidoEnum.CANCELADO || this.value === StatusPedidoEnum.ENTREGUE;
  }
}
```

VO com normalização:

```ts
import { Result, ValueObject, type ValueObjectConfig } from "@poiesis/shared";

export class CodigoRastreioVO extends ValueObject<string, ValueObjectConfig> {
  private static readonly INVALID = "codigo-rastreio.invalido";

  private constructor(value: string, config?: ValueObjectConfig) {
    super(value, config);
  }

  static create(value: string, config?: ValueObjectConfig): CodigoRastreioVO {
    const result = CodigoRastreioVO.tryCreate(value, config);
    result.validator.throwsIfFailed();
    return result.instance;
  }

  static tryCreate(value: unknown, config?: ValueObjectConfig): Result<CodigoRastreioVO> {
    const normalizado = typeof value === "string" ? value.trim().toUpperCase() : "";
    if (!/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(normalizado)) return Result.fail(CodigoRastreioVO.INVALID);
    return Result.ok(new CodigoRastreioVO(normalizado, config));
  }
}
```

## Reference VOs

- `email.vo.ts` para normalizacao, regex e getters `local`/`domain`.
- `id.vo.ts` para geracao default (uuid) e metodo `required`.
- `permission-id.vo.ts` para heranca que apenas especializa a mensagem de erro.
- `strong-password.vo.ts` para validacoes multiplas.
- `url.vo.ts` e `number.vo.ts` para casos de tipos diferentes.

## Test Pattern

- Validar sucesso e falha (`isOk`, `isFailure`, `errors`).
- Verificar normalizacao do valor armazenado.
- Testar `create` lancando erro quando invalido.
- Cobrir getters derivados quando existirem.
