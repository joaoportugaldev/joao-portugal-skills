# Backend Provider Pattern

## Localização

- Para um único módulo, use a pasta de providers da capacidade proprietária no backend conforme a estrutura local. Em uma estrutura nova, a referência arquitetural é `apps/backend/src/modules/<modulo>/<capacidade>/adapters/outbound/providers/`.
- Para uma implementação reutilizada por módulos diferentes, use `apps/backend/src/shared/provider/`. O local compartilhado da implementação não transfere a propriedade das interfaces: cada módulo consumidor declara sua porta.
- Se a pasta contiver várias implementações, mantenha `index.ts` para expor somente os adaptadores e factories usados pela composição ou por testes.

## Nomes

Use `<capacidade>-<tecnologia>.provider.ts` para a implementação e `<Capacidade><Tecnologia>Provider` para a classe. Exemplos:

| Arquivo | Classe |
| --- | --- |
| `envio-email-resend.provider.ts` | `EnvioEmailResendProvider` |
| `envio-email-captura.provider.ts` | `EnvioEmailCapturaProvider` |
| `envio-whatsapp-zapi.provider.ts` | `EnvioWhatsappZApiProvider` |

`<tecnologia>` identifica a integração ou estratégia concreta, como Resend, Z-API ou captura. Não coloque o fornecedor no nome da interface do módulo. Para seleção entre implementações, use `<capacidade>-provider.factory.ts`; a factory não é uma implementação da porta.

## Exemplo

Porta declarada no módulo consumidor, em `modules/notificacao/src/envio/provider/envio-email.provider.ts`:

```ts
import type { Result } from "@poiesis/shared";
import type { EmailDTO } from "../dto/email.dto";

export interface EnvioEmailProvider {
  enviar(email: EmailDTO): Promise<Result<void>>;
}
```

Implementação no backend, em `providers/envio-email-resend.provider.ts`. O adaptador recebe o cliente pronto, traduz o contrato do fornecedor e converte a exceção em `Result`:

```ts
import { Result } from "@poiesis/shared";
import type { EmailDTO, EnvioEmailProvider } from "@namespace/notificacao/envio";
import type { Resend } from "resend";

export class EnvioEmailResendProvider implements EnvioEmailProvider {
  constructor(
    private readonly cliente: Resend,
    private readonly remetente: string,
  ) {}

  async enviar({ destinatario, assunto, html }: EmailDTO): Promise<Result<void>> {
    try {
      const { error } = await this.cliente.emails.send({ from: this.remetente, to: destinatario, subject: assunto, html });
      return error ? Result.fail("envio-email.recusado-pelo-provedor") : Result.ok();
    } catch {
      return Result.fail("envio-email.provedor-indisponivel");
    }
  }
}
```

Função auxiliar compartilhada pelos adaptadores, em `providers/remetente-padrao.util.ts`:

```ts
export function remetentePadrao(ambiente: string): string {
  return ambiente === "production" ? "contato@exemplo.com" : "teste@exemplo.com";
}
```

## Contrato e composição

- Importe as interfaces pela API pública dos módulos consumidores. Um adaptador compartilhado pode implementar mais de uma porta quando satisfizer cada contrato.
- Injete credenciais, clientes e coletores necessários. Traduza respostas e falhas externas para os resultados e erros exigidos por cada porta.
- Mantenha a escolha entre envio real e captura na factory e entregue o adaptador pronto na composição. Preserve as regras de ambiente vigentes.
- Quando o projeto já tem um adaptador compartilhado que atende à mesma porta em vários módulos (por exemplo, o de autorização), reutilize-o. Não crie um adaptador equivalente por módulo.
- Verifique os consumidores, exports e testes após renomeações. Use os testes próximos para cobrir a seleção e a tradução quando esses comportamentos mudarem.
