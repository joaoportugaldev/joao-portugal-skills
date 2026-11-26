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

## Contrato e composição

- Importe as interfaces pela API pública dos módulos consumidores. Um adaptador compartilhado pode implementar mais de uma porta quando satisfizer cada contrato.
- Injete credenciais, clientes e coletores necessários. Traduza respostas e falhas externas para os resultados e erros exigidos por cada porta.
- Mantenha a escolha entre envio real e captura na factory e entregue o adaptador pronto na composição. Preserve as regras de ambiente vigentes.
- A porta `AuthProvider` de cada módulo já é atendida pelo adaptador compartilhado `AuthFacadeProvider` (`apps/backend/src/shared/provider/`), criado por `createAuthProvider`. Não crie um adaptador de autorização por módulo; se a porta precisar de um método novo, ele entra primeiro no catálogo da ADR `adr-shared-autorizacao-por-auth-provider`.
- Verifique os consumidores, exports e testes após renomeações. Use os testes próximos para cobrir a seleção e a tradução quando esses comportamentos mudarem.
