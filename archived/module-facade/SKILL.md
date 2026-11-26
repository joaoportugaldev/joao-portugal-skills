---
name: module-facade
description: >-
  Crie, revise ou migre fachadas de aplicação em módulos DDD. Use quando o pedido envolver "fachada", "facade", arquivos *.facade.ts, composição e exposição de casos de uso (use cases), injeção de dependências, exports públicos, wiring na raiz de composição (composition root) ou testes de delegação e autorização pela facade.
---

# Module Facade

## Overview

Exponha operações relacionadas por uma entrada pública de aplicação. A facade recebe as dependências, delega aos casos de uso e preserva seus contratos.

## Guidelines

- Leia [facade-pattern.md](references/facade-pattern.md) antes de criar ou alterar uma facade.
- Agrupe operações da mesma capacidade. Reutilize tipos de entrada, saída e contexto de usuário dos casos de uso.
- Siga a composição adotada pelo projeto. Injete casos de uso já compostos ou as portas necessárias para construí-los dentro da facade.
- Chame a entrada pública do caso de uso para preservar a autorização. Mantenha validação, regras de negócio e persistência nas camadas responsáveis.

## Workflow

1. Identifique as operações, os consumidores, os contratos públicos e as dependências. Inspecione as facades e os testes próximos.
2. Implemente a delegação com os tipos existentes. Preserve assinaturas, resultados, erros e autorização salvo mudança solicitada.
3. Ajuste os exports e a raiz de composição quando afetados. Confira os consumidores e remova referências obsoletas após renomear.
4. Execute os testes próximos e o typecheck ou build do pacote. Se a composição mudou, valide também a aplicação consumidora.

## References

Consulte [facade-pattern.md](references/facade-pattern.md) para estrutura, composição, exemplo e testes.

## Global Standards

Siga as convenções do projeto consumidor. Em TypeScript, use `<capacidade>.facade.ts` em kebab-case e uma classe PascalCase com sufixo `Facade` quando essa for a convenção local.
