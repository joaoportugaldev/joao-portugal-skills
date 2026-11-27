---
name: backend-provider
description: >-
  Crie ou revise implementações de interfaces Provider no backend. Use para adaptadores concretos, escolha da pasta proprietária, nomes *.provider.ts, factories de seleção e integração com a composição. Para declarar a porta no módulo consumidor, use module-provider.
---

# Backend Provider

## Overview

Implemente no backend uma capacidade definida por uma porta de saída do módulo consumidor. Mantenha tecnologia, SDK, transporte e configuração fora do contrato do módulo.

## Guidelines

- Leia [backend-provider-pattern.md](references/backend-provider-pattern.md) antes de criar ou alterar uma implementação.
- Escolha a pasta pela abrangência real: dentro da capacidade do módulo backend quando apenas ela usa o adaptador; em `apps/backend/src/shared/provider/` quando a implementação serve a mais de um módulo.
- Nomeie o arquivo `<capacidade>-<tecnologia>.provider.ts` e a classe `<Capacidade><Tecnologia>Provider`. Use a capacidade da porta e termine o nome da classe em `Provider`.
- Faça a classe cumprir as interfaces consumidoras por seus contratos públicos. Traduza erros e dados da tecnologia na implementação, sem vazar seus tipos para as portas.
- Todo arquivo do adaptador tem sufixo de tipo. Um arquivo que só exporta funções auxiliares dos adaptadores (ler linhas, montar a página, extrair o ator da requisição) chama-se `<nome>.util.ts`. Não use nome sem sufixo (`paginacao-pedidos.ts`) nem só com a tecnologia (`paginacao-pedidos.knex.ts`).
- O `try`/`catch` das exceções da tecnologia fica no adaptador, que devolve `Result` com um código de falha. Nenhuma exceção atravessa a porta.
- Quando a seleção entre implementações depender do ambiente, mantenha a factory junto dos adaptadores, com nome `<capacidade>-provider.factory.ts`; construa a dependência concreta na composição, não no caso de uso ou controller.

## Workflow

1. Identifique os módulos consumidores, a porta de cada um, as implementações existentes e a raiz de composição.
2. Escolha a pasta proprietária, implemente somente as operações da porta e ajuste a factory se houver seleção real ou captura.
3. Atualize o `index.ts`, imports, composição e testes diretamente afetados; preserve o comportamento e os contratos existentes salvo mudança solicitada.
4. Valide o build do backend e os testes próximos, inclusive seleção de ambiente e tradução de falhas quando afetadas.

## References

Consulte [backend-provider-pattern.md](references/backend-provider-pattern.md) para localização, nomes e fronteiras.

## Global Standards

Siga [skills-standards.md](../skills-standards.md) e `docs/architecture.md` do projeto consumidor. Preserve nomes e caminhos legados em alterações pontuais, salvo migração solicitada.
