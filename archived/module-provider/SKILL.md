---
name: module-provider
description: >-
  Crie, revise ou migre interfaces Provider como portas de saída de módulos. Use quando o pedido envolver um contrato para capacidade externa ou de outro domínio, arquivos *.provider.ts, métodos de uma porta ou tipos consumidos por ela. Para persistência, use module-repository.
---

# Module Provider

## Overview

Defina a capacidade externa necessária ao módulo consumidor por uma interface independente de infraestrutura. Esta skill trata somente da porta e dos tipos necessários ao contrato.

## Guidelines

- Leia [provider-pattern.md](references/provider-pattern.md) antes de criar ou alterar uma porta.
- Coloque a interface no submódulo consumidor. Quando a mesma capacidade atender diferentes submódulos do mesmo módulo, coloque-a em `src/app/providers/` desse módulo. Defina somente métodos, parâmetros e retornos exigidos pelos consumidores atuais.
- Nomeie a capacidade, sem vincular o contrato ao fornecedor concreto. Use arquivo `<capacidade>.provider.ts`, sem repetir `provider` no nome base, e interface PascalCase `<Capacidade>Provider`, com `Provider` no final.
- Declare exatamente uma interface Provider por arquivo `<capacidade>.provider.ts`. Não agrupe várias portas em um arquivo, mesmo quando são usadas pelo mesmo caso de uso ou adaptador.
- Exporte a interface por nome no próprio arquivo, sem `default`. Quando a pasta contiver mais de um Provider, mantenha um `index.ts` que reúna e reexporte os contratos; importe-os por esse ponto local.
- Use tipos de entrada e saída próprios do consumidor quando a fronteira exigir dados. Não exponha SDKs, frameworks, tipos do fornecedor ou entidades internas de outro domínio.
- Persistência pertence a `module-repository`. Para implementação e factory no backend, use `backend-provider`; esta skill define somente a porta.

## Workflow

1. Leia o contexto do domínio e inspecione o consumidor, as portas e os tipos próximos. Identifique a capacidade e as operações realmente necessárias.
2. Defina ou ajuste cada interface Provider em seu próprio arquivo e os tipos do contrato na área consumidora. Explicite ausência, falhas e comportamento assíncrono quando afetarem o consumidor.
3. Atualize o `index.ts` da pasta quando houver mais de um Provider e exponha a porta na API pública do pacote quando um consumidor externo precisar implementá-la ou referenciá-la. Confira o `package.json` e evite imports internos por caminhos profundos.
4. Confira os usos e a tipagem afetados, execute a validação mais próxima e revise o diff para preservar contratos existentes.

## References

Consulte [provider-pattern.md](references/provider-pattern.md) para localização, nomenclatura, exemplo e revisão do contrato.

## Global Standards

Siga [skills-standards.md](../skills-standards.md), a arquitetura e o vocabulário do projeto consumidor. A nomenclatura desta skill aplica-se a arquivos novos; preserve caminhos e nomes legados em alterações pontuais, salvo renomeação solicitada.
