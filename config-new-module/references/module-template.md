# Contrato do módulo

## Entradas

- `--name` identifica o módulo em kebab-case.
- `--scope` define o namespace do pacote. A precedência é argumento, configuração local, configuração versionada da raiz, configuração ativa das skills e nome sem namespace. Em um projeto com namespace estabelecido, informe-o explicitamente se estiver ausente da configuração.
- `--modules-dir` define a raiz de domínio. A precedência é argumento, configuração local, configuração versionada da raiz, configuração ativa das skills, `modules/` se o manifesto declarar `modules/*`, e `packages/` como fallback. Confirme a raiz pela arquitetura antes de aplicar.
- `--apply` grava o scaffold. Sem a opção, o gerador só mostra o plano.

Veja o [contrato de configuração compartilhada](../../config-project/references/bootstrap-contract.md).

## Saída do gerador npm

O manifesto raiz deve cobrir o novo módulo com o caminho explícito ou `<raiz>/*`. O gerador verifica colisões de diretório e nome e cria um pacote privado com `package.json`, `src/index.js` como entrada ESM e `test/index.test.js` para testar a importação pelo nome público. Rode `npm test --workspace <nome-do-pacote>` após a criação.

## Integração na stack escolhida

Para TypeScript ou outra stack, siga os manifestos e configurações dos módulos vizinhos. Declare a API pública conforme o mecanismo de exportação local. Em apps consumidores, adicione a dependência e conecte apenas os adaptadores, rotas e interfaces previstos no pedido. Atualize o lockfile com o gerenciador do projeto e valide os consumidores afetados.
