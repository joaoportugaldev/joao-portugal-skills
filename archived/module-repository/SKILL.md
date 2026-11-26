---
name: module-repository
description: >-
  Crie, revise ou migre portas e adaptadores de repositório. Use quando o pedido envolver "repositório de domínio", "repository", arquivos *.repository.ts, persistência de agregados, mapeamento entre domínio e armazenamento, transações ou repositórios em memória para testes.
---

# Module Repository

## Overview

Modele a persistência de agregados com contratos no domínio proprietário e implementação nos adaptadores de infraestrutura.

## Guidelines

- Leia [repository-pattern.md](references/repository-pattern.md) antes de criar ou alterar um repositório.
- Modele operações a partir das necessidades dos casos de uso.
- Injete o cliente de persistência no adaptador e mantenha tipos do banco, mapeamento de registros e tratamento de falhas de infraestrutura nessa camada. Siga o contrato local de retorno e erros.

## Workflow

1. Confirme a raiz do agregado, os consumidores, a semântica de ausência e as regras de consistência.
2. Defina ou ajuste a interface no domínio. Inspecione repositórios e testes vizinhos antes de introduzir um padrão.
3. Implemente o adaptador e o mapeamento. Preserve o formato persistido e use transações nas escritas que precisam concluir juntas.
4. Ajuste exports, composição e implementações em memória diretamente afetados.
5. Execute os testes mais próximos. Para mudanças de SQL, constraints ou transações, valide o comportamento em integração quando o ambiente estiver disponível.

## References

Consulte [repository-pattern.md](references/repository-pattern.md) para caminhos, exemplos, checklist e estratégia de testes.

## Global Standards

Siga as convenções de linguagem, nomes, pastas, imports e testes do projeto consumidor. Use o vocabulário do domínio e preserve os caminhos existentes em alterações pontuais.
