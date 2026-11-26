---
name: frontend-system-design
description: >-
  Crie, revise ou documente componentes reutilizáveis de frontend (reusable UI components). Use quando o pedido envolver criar ou adaptar um componente a partir de screenshot, React, Tailwind, CSS ou descrição, adicionar variantes e estados visuais, ou registrar um componente no catálogo interno System Design (component showcase), como /system-design.
argument-hint: 'Descreva o componente, seus estados e onde ele deve aparecer no catálogo.'
---

# Frontend System Design

## Overview

Crie ou atualize componentes reutilizáveis e mantenha o catálogo interno alinhado às interfaces, variantes e estados reais.

## Guidelines

- Leia [system-design-pattern.md](references/system-design-pattern.md) antes de criar um componente ou alterar o catálogo.
- Procure componentes equivalentes e prefira reutilizar, compor ou estender a implementação existente. Confirme a intenção se houver duplicação material.
- Use as convenções de componentes, estilos, tokens e acessibilidade do projeto. Mantenha a interface pequena e livre de regras específicas de página.
- Mantenha o catálogo interno restrito aos ambientes autorizados, com acesso bloqueado em produção. Preserve a opção de apenas registrar um componente existente.

## Workflow

1. Identifique se o pedido é de criação, atualização, variante ou registro. Inspecione o catálogo e os componentes próximos.
2. Escolha os arquivos e implemente o escopo. Para referências visuais, traduza a hierarquia e os estados para os padrões locais.
3. Registre ou atualize as demonstrações no catálogo. Se o pedido tratar apenas do registro, use o componente existente.
4. Verifique os estados e a navegação relevantes, a acessibilidade e a proteção de acesso. Rode as verificações mais próximas do frontend.

## References

Consulte [system-design-pattern.md](references/system-design-pattern.md) para organização, exemplos de registro e validação.

## Global Standards

Siga a estrutura, os nomes de arquivos, a biblioteca de UI, o roteador e os scripts do projeto consumidor.
