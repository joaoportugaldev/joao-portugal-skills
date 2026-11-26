---
name: frontend-route-migration
description: >-
  Migre rotas de frontend no Next.js Pages Router. Use quando o pedido envolver mudar, renomear ou mover uma URL (route migration), propor um novo caminho, atualizar arquivos em pages, links, navegação ou regras de acesso, ou definir o tratamento da rota antiga preservando o comportamento da página.
---

# Frontend Route Migration

## Overview

Altere o caminho público de uma página do Next.js Pages Router e mantenha seu comportamento, acesso e fluxo de dados.

## Guidelines

- Leia [route-migration-pattern.md](references/route-migration-pattern.md) antes de migrar uma rota.
- Preserve a implementação da página e mova apenas o ponto de entrada da rota. Atualize referências de URL nos módulos quando necessário.
- Use a nova URL como caminho canônico. Por padrão, retire a rota antiga. Adicione redirect ou alias quando o usuário pedir compatibilidade.

## Workflow

1. Localize a aplicação, o arquivo da rota e a página que ele renderiza. Identifique os consumidores da URL e as regras de acesso e layout.
2. Confirme o caminho de destino e o tratamento da rota antiga. Se o destino estiver em aberto, proponha caminhos com base no vocabulário do produto e confirme antes de editar.
3. Mova o ponto de entrada e atualize as referências afetadas. Preserve segmentos dinâmicos, parâmetros de consulta e comportamento de navegação.
4. Verifique conflitos de rota e referências antigas. Rode os checks relevantes e informe como a URL antiga passou a se comportar.

## References

Consulte [route-migration-pattern.md](references/route-migration-pattern.md) para o inventário, um exemplo de migração e o checklist de validação.

## Global Standards

Siga a estrutura, o vocabulário e os scripts do projeto consumidor. Preserve a convenção de arquivos do Pages Router, incluindo segmentos dinâmicos em colchetes.
