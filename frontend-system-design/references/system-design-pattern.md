# System Design Pattern

## Localização

- Localize a raiz da aplicação, o diretório de componentes compartilhados e o catálogo. Use a rota ou ferramenta de catálogo que já existe.
- Em projetos com catálogo como página interna, `/system-design` é um caminho possível. Resolva seu arquivo pelo roteador do projeto.
- Atualize o componente onde ele já vive. Coloque novos componentes junto às primitivas reutilizáveis da mesma família e respeite o destino explícito do pedido.

## Componente

- Procure pelo propósito e pela interface antes de criar. Reutilize primitivas, tokens e variantes existentes.
- Defina propriedades tipadas pela intenção da UI. Use composição, como `children` ou slots, e extensões como `className` quando fizerem sentido na biblioteca local.
- Mostre estados que o componente oferece de fato, como carregamento, vazio, desabilitado, selecionado ou destrutivo.
- Preserve semântica, rótulos, foco e interação por teclado quando aplicáveis. Deixe dados, efeitos e regras de negócio com a página ou camada responsável.

## Catálogo interno

- Organize por categorias estáveis, como fundações, componentes e padrões de layout. Ao criar ou reorganizar uma página interna, use navegação horizontal entre as seções principais quando compatível com o catálogo. Destaque a seleção e renderize apenas o conteúdo da seção ativa.
- Para cada item, inclua nome, finalidade, caminho, demonstração renderizada, variantes relevantes, exemplo de uso e propriedades principais quando aplicáveis.
- Demonstre os estados com dados locais representativos. Quando o pedido for só de registro, limite a alteração ao catálogo.

## Proteção de acesso

Reutilize o mecanismo do projeto para excluir ferramentas internas do build de produção ou bloquear a rota no servidor. Confira a configuração usada pelo build ou pelo servidor implantado. Para uma rota bloqueada, siga o tratamento local, como 404 ou redirecionamento.

## Exemplo

Para registrar um `MetricCard` com tendência e carregamento, procure primeiro cartões de métricas. Reutilize ou estenda o componente existente se ele atender ao contrato. No catálogo, renderize o estado padrão, as tendências oferecidas e o carregamento com dados locais. Inclua um trecho de uso e as propriedades que controlam esses estados.

## Checklist de validação

- A interface, os estados e os estilos correspondem às convenções locais.
- O catálogo renderiza o componente real e documenta os estados pedidos.
- A navegação do catálogo e a proteção em produção funcionam conforme a configuração. Verifique a página no navegador quando o ambiente estiver disponível.
- Rode typecheck, lint ou testes relevantes e informe o que foi verificado.
