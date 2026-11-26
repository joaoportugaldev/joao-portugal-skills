---
name: config-new-module
description: Crie um workspace para um novo módulo de negócio em um monorepo, com API pública e integração nas aplicações quando solicitada. Use para scaffold de módulo novo. Para agregados em módulos existentes, use o procedimento de agregados do projeto.
---

# Configurar novo módulo

1. Identifique a capacidade de negócio, o nome e os consumidores previstos. Confira o mapa de contextos, quando existir, e os módulos próximos para evitar criar um segundo dono para a mesma capacidade.
2. Resolva a raiz do módulo pelo workspace ativo e pela arquitetura. Leia a configuração ativa de estrutura e namespace conforme o contrato compartilhado. Use `modules/<nome>` quando essa for a raiz de negócio configurada. Em um monorepo que usa `packages/<nome>` para domínio, siga essa convenção. Se configuração, manifestos e arquitetura divergirem, esclareça o destino antes de criar arquivos.
3. Verifique colisões de diretório e nome de pacote. Se o workspace já existir, trate o pedido como ampliação ou reconciliação conforme o escopo. Para um novo workspace, crie o manifesto, o ponto de entrada público e as configurações mínimas de build e teste conforme a linguagem e os módulos vizinhos. Use o namespace e as convenções de dependências internas do projeto. Mantenha domínio e aplicação independentes dos frameworks de entrega e persistência.
4. Integre apenas as aplicações solicitadas ou necessárias para o fluxo pedido. Declare a dependência nos consumidores efetivos e siga os pontos de composição, rotas e adaptadores já usados por cada app. Exponha pela API pública apenas os contratos usados pelos consumidores.
5. Confira se o novo workspace está coberto pela configuração e atualize o lockfile quando aplicável. Valide a descoberta do módulo, seu build ou checagem equivalente e o fluxo nos consumidores alterados.

Consulte [os padrões locais](../skills-standards.md) quando disponíveis. Use nomes de módulo em kebab-case conforme a convenção local. Framework, ORM e pacotes compartilhados vêm do projeto consumidor.

## Comando

Na raiz do projeto consumidor, execute com Node.js 24:

```bash
node <SKILLS_DIR>/config-new-module/scripts/create-module.mjs --name pedidos --scope @organizacao
```

Confira a prévia e acrescente `--apply` para gravar. Use o gerador quando a base JavaScript ESM for compatível com o projeto. Para módulos TypeScript ou outra stack, use um módulo vizinho como referência para o manifesto, a entrada pública e a configuração de testes, conforme o contrato abaixo.

## Recursos

- [Contrato do módulo](references/module-template.md)
- [Gerador de módulo](scripts/create-module.mjs)
- [Utilitários compartilhados](../config-utils/workspace.mjs)
