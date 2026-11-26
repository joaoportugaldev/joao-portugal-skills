# Provider Pattern

## Propriedade e localização

A porta pertence ao módulo ou submódulo que precisa da capacidade. Quando só um submódulo a utiliza, prefira `modules/<modulo>/src/<capacidade>/provider/` conforme a estrutura local. Quando diferentes submódulos do mesmo módulo a utilizam, use `modules/<modulo>/src/app/providers/`. Essa pasta pode abrigar outros contratos e fluxos de aplicação que atravessem submódulos quando houver necessidade concreta; não crie estrutura antecipadamente. Uma capacidade fornecida por outro domínio continua sendo descrita do ponto de vista do consumidor: a porta e o tipo de retorno pertencem a ele. O adaptador externo que traduz o contrato do fornecedor fica fora do escopo desta skill.

Use Provider para capacidades externas que não sejam persistência. Consultas e gravações de agregados pelo armazenamento pertencem a `module-repository`. Confirme a responsabilidade pelos consumidores reais, não apenas pelo nome de uma interface existente.

## Contrato e nomes

- Arquivo: `<capacidade-em-kebab-case>.provider.ts`, por exemplo `envio-email.provider.ts`; o sufixo já indica Provider, então não use `provedor-envio-email.provider.ts`.
- Interface: `<Capacidade>Provider` em PascalCase, por exemplo `EnvioEmailProvider`.
- Cada arquivo `.provider.ts` declara exatamente uma interface Provider. Separe capacidades distintas em arquivos próprios, inclusive quando compartilham consumidores ou implementação concreta.
- Declare `export interface`, sem exportação `default`.
- A capacidade descreve o que o consumidor precisa, sem citar Resend ou outro fornecedor concreto.
- Inclua apenas operações usadas pelo consumidor. Escolha parâmetros, retornos, nulabilidade e erros a partir do comportamento necessário. Não antecipe métodos para possíveis adaptadores.
- Defina tipos de dados locais quando o contrato atravessar uma fronteira de domínio. Retorne apenas os campos necessários, sem importar entidades internas do fornecedor, SDKs ou tipos de infraestrutura.

## Exemplo mínimo

`modules/<modulo>/src/app/providers/envio-email.provider.ts`, quando diferentes submódulos precisam do envio:

```ts
export interface EnvioEmailProvider {
  enviar(entrada: { destinatario: string; assunto: string; conteudo: string }): Promise<void>;
}
```

O retorno `void` é apenas ilustrativo: use o resultado ou a falha que o caso de uso realmente precise observar. Uma implementação com Resend pode satisfazer a interface no backend, mas sua implementação e composição não pertencem a esta skill.

## Exports e revisão

- Com mais de um arquivo de Provider na mesma pasta, crie ou atualize `index.ts` para reexportar as interfaces nomeadas. Consuma os contratos pelo `index.ts` local, sem repetir o caminho de cada arquivo nos imports.
- Confira os barrels locais e a API pública do pacote. Exporte a interface como tipo quando uma aplicação ou outro consumidor externo precisar dela; mantenha tipos internos não exportados quando não houver esse uso.
- Confirme que consumidores não precisem importar arquivos internos por caminhos profundos e que a porta não crie dependência circular entre domínios.
- Ao alterar uma porta existente, confira seus consumidores e tipos de implementação, preserve assinaturas públicas salvo mudança solicitada e valide com typecheck ou build do workspace afetado.
- Na revisão, confira se cada `.provider.ts` contém somente uma interface Provider; o `index.ts` reúne as exportações, sem declarar portas.
- A estrutura atual contém nomes legados. A regra `.provider.ts` orienta novos contratos; não renomeie portas existentes apenas para uniformizar nomes.
