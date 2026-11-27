# Domain Service Pattern

## Quando criar

Use um serviço de domínio quando a regra de negócio não pertencer naturalmente a uma entidade ou objeto de valor, ou quando mais de um caso de uso precisar da mesma regra. Coloque a regra junto à capacidade proprietária ou em uma área compartilhada do mesmo domínio quando houver reúso. Mantenha invariantes no modelo que controla seu estado e orquestração no caso de uso.

Uma regra usada por um único caso de uso é um método privado desse caso de uso, não um serviço. O pacote de domínio não tem arquivos `*.util.ts`.

## Estrutura esperada

- Classe `XxxService` em `service/xxx.service.ts`, uma por arquivo, com métodos estáticos quando não guarda estado. Não exporte funções soltas.
- O método recebe apenas os dados necessários. Quando recebe um conjunto de campos, o tipo do parâmetro é declarado na própria assinatura, sem interface ou DTO nomeado.
- Tempo e configuração variável entram como parâmetro (`agora: Date`), nunca lidos dentro da regra.
- Quando a regra pode falhar, o retorno é `Result`, com códigos `entidade.motivo`. Sem `try`/`catch` e sem `throw`.
- Por padrão, o caso de uso consulta as portas e entrega os fatos ao serviço.
- Exceção: quando vários casos de uso repetiriam a mesma sequência de consultas para chegar ao mesmo fato, o serviço recebe as portas como parâmetro e faz as consultas ele mesmo. Ele só lê: gravações e efeitos continuam no caso de uso. Falhas das portas são devolvidas com seus códigos.

## Exemplo

`envio/service/frete.service.ts` — regra de cálculo usada pelos casos de uso de cotação e de fechamento do pedido:

```ts
import { Result } from "@poiesis/shared";

/** Calcula o frete em centavos a partir do peso e da distância. */
export class FreteService {
  static readonly PESO_MAXIMO_KG = 30;

  static calcular({ pesoKg, distanciaKm, expresso }: {
    pesoKg: number;
    distanciaKm: number;
    expresso?: boolean;
  }): Result<number> {
    if (pesoKg <= 0 || pesoKg > FreteService.PESO_MAXIMO_KG) return Result.fail("frete.peso-invalido");
    if (distanciaKm < 0) return Result.fail("frete.distancia-invalida");

    const base = 1200 + Math.ceil(pesoKg) * 150 + Math.ceil(distanciaKm / 10) * 80;
    return Result.ok(expresso ? Math.round(base * 1.5) : base);
  }
}
```

`pedido/service/pedido-access.service.ts` — regra que interpreta um fato consultado pelo caso de uso. O serviço não chama a porta; quem chama é o caso de uso:

```ts
import { Result } from "@poiesis/shared";

/** Decide o acesso às operações de pedido a partir da resposta do provedor de autorização. */
export class PedidoAccessService {
  static readonly MANAGER_TYPES = ["GERENTE", "ADMIN"] as const;

  static resolve(answer: Result<boolean>): Result<void> {
    // Uma consulta que falhou é devolvida com seus códigos, para não ser confundida com negação.
    if (answer.isFailure) return Result.fail(answer.errors);
    return answer.instance ? Result.ok() : Result.fail("pedido.acesso-negado");
  }
}
```

Uso no caso de uso:

```ts
const autorizado = PedidoAccessService.resolve(
  await this.auth.userHasType({ actor, types: PedidoAccessService.MANAGER_TYPES }),
);
if (autorizado.isFailure) return autorizado.withFail;

const frete = FreteService.calcular({ pesoKg: pedido.pesoKg, distanciaKm, expresso: data.expresso });
if (frete.isFailure) return frete.withFail;
```

## Exemplo: serviço que faz as próprias consultas

Quatro casos de uso de listagem precisam saber quais lojas quem chama pode ver. A resposta exige duas consultas em sequência. Para não repetir essa sequência em cada caso de uso, o serviço recebe as portas e devolve o fato pronto.

`pedido/service/lojas-acessiveis.service.ts`

```ts
import { Result, type Actor } from "@poiesis/shared";
import type { AuthProvider } from "../../app/provider/auth.provider";
import type { ListarLojasDoGerenteQuery } from "../provider/listar-lojas-do-gerente.query";

export class LojasAcessiveisService {
  /** Devolve null para acesso a todas as lojas, ou a lista das lojas que o gerente administra. */
  static async obter({ actor, auth, lojasDoGerente }: {
    actor: Actor;
    auth: Pick<AuthProvider, "userHasType">;
    lojasDoGerente: ListarLojasDoGerenteQuery;
  }): Promise<Result<string[] | null>> {
    if (actor.kind !== "user") return Result.fail("pedido.acesso-negado");

    const admin = await auth.userHasType({ actor, types: ["ADMIN"] });
    if (admin.isFailure) return admin.withFail;
    if (admin.instance) return Result.ok(null);

    const lojas = await lojasDoGerente.execute({ gerenteId: actor.id });
    if (lojas.isFailure) return lojas.withFail;
    return Result.ok(lojas.instance.map((loja) => loja.id));
  }
}
```

Uso em cada caso de uso de listagem:

```ts
const escopo = await LojasAcessiveisService.obter({ actor, auth: this.auth, lojasDoGerente: this.lojasDoGerente });
if (escopo.isFailure) return escopo.withFail;
```

## Estratégia de testes

Teste entradas representativas, limites e valores vazios ou inválidos conforme a regra. Fixe data e configuração variáveis. Ao extrair uma regra, verifique que o caso de uso mantém seu comportamento.

## Armadilhas comuns

- Exportar uma função solta de `*.service.ts`, ou reexportar o serviço por `enums/index.ts` ou outro barrel que não é o dele.
- Fazer consultas dentro do serviço quando só um caso de uso precisa delas: nesse caso a consulta fica no caso de uso.
- Gravar ou disparar efeitos dentro do serviço. Ele pode ler pelas portas, nunca escrever.
- Criar interface ou DTO nomeado só para tipar o parâmetro do método.
- Ler o relógio (`new Date()`) dentro da regra em vez de receber o instante.
