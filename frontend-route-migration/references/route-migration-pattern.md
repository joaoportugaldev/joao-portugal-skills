# Frontend Route Migration Pattern

## Mapeamento da rota

- Localize a pasta `pages/` ou `src/pages/` da aplicação. Verifique também caminhos configurados, como prefixos, rewrites e redirects, quando afetarem a URL.
- A rota `/recursos` pode estar em `pages/recursos.tsx` ou `pages/recursos/index.tsx`. A rota `/recursos/:id` usa um arquivo como `pages/recursos/[id].tsx`.
- Identifique a página renderizada e as funções de carregamento, metadados ou configurações exportadas pelo arquivo da rota.

## Inventário de referências

- Links, chamadas de navegação, objetos com `pathname`, constantes, builders de URL e retornos após login.
- Middleware, rotas públicas, regras de permissão, resolvers de layout, redirects e rewrites.
- Testes, mocks, documentação, emails e consumidores externos conhecidos. Diferencie páginas aninhadas, endpoints e outras ocorrências que apenas compartilham um prefixo.

## Exemplo

Ao mover `/cadastro` para `/cadastro/usuario`, realoque o ponto de entrada de `src/pages/cadastro/index.tsx` para `src/pages/cadastro/usuario.tsx`. Preserve a página renderizada e seus exports, ajustando imports relativos se necessário. Atualize links e condições de acesso que apontavam para `/cadastro`. Mantenha os parâmetros de consulta em links existentes e remova o ponto de entrada antigo, salvo compatibilidade solicitada.

Escolha URLs que expressem o conceito para o usuário. Confira colisões com rotas estáticas, dinâmicas e fluxos administrativos antes de mover.

## Checklist de validação

- A URL nova renderiza a mesma página e mantém carregamento, permissões, layout e navegação.
- A URL antiga foi retirada ou segue a compatibilidade explicitamente definida.
- Segmentos dinâmicos, query e fragmentos relevantes continuam chegando ao destino.
- A busca pelos dois caminhos confirma os consumidores atualizados e justifica referências antigas mantidas.
- Execute typecheck, lint ou testes próximos conforme o projeto. Quando a aplicação estiver disponível, confira a navegação e o comportamento das duas URLs no navegador. Informe os checks executados e as limitações.
