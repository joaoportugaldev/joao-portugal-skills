---
name: module-domain-service
description: >-
  Crie, revise ou extraia serviços de domínio. Use quando o pedido envolver "serviço de domínio", "domain service", políticas de negócio ou cálculos entre entidades e objetos de valor do mesmo domínio, incluindo testes dessas regras. Para arquivos *.service.ts, confirme que a responsabilidade é de domínio.
---

# Module Domain Service

## Overview

Encapsule uma regra de negócio que não pertence naturalmente a um único objeto de domínio. Dê à regra uma interface pequena, com entradas explícitas e resultado previsível.

## Guidelines

- Leia [domain-service-pattern.md](references/domain-service-pattern.md) antes de criar ou alterar um serviço de domínio.
- Mantenha o serviço no domínio proprietário. Receba os dados necessários e deixe I/O, persistência e coordenação de operações com os casos de uso e adaptadores.
- Preserve invariantes intrínsecas nas entidades e objetos de valor. Prefira uma função ou classe simples, nomeada pela intenção da regra.

## Workflow

1. Leia o contexto do domínio e os modelos e consumidores próximos. Identifique a regra, seu proprietário e os dados necessários para avaliá-la.
2. Confirme que a regra precisa de um serviço. Escolha o local pelo alcance da regra e defina entradas, resultado e falhas esperadas.
3. Implemente a regra e conecte os consumidores afetados. Reutilize tipos, validadores e erros do domínio.
4. Teste cenários relevantes e limites no workspace proprietário. Ao extrair uma regra existente, verifique também o comportamento dos consumidores.

## References

Consulte [domain-service-pattern.md](references/domain-service-pattern.md) para fronteiras, exemplos e testes.

## Global Standards

Siga as convenções de linguagem, nomes, pastas, imports e testes do projeto consumidor. Use o vocabulário do domínio e preserve os caminhos existentes em alterações pontuais.
