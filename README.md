# joao-portugal-skills

Coleção de skills para agentes de IA com foco em **Domain-Driven Design (DDD)** e **Clean Architecture**, pensada para padronizar a arquitetura e a forma de implementação em múltiplos projetos.

Este repositório foi desenhado para ser reutilizado como **Git submodule** em outros repositórios, permitindo compartilhar a mesma base de skills entre times e produtos.

## Propósito

O objetivo é oferecer um conjunto de instruções reutilizáveis para agentes que cubra, de ponta a ponta:

- bootstrap do projeto e setup de monorepo com **TurboRepo**;
- modelagem de domínio com **Entidades**, **Value Objects** e **Domain Services**;
- camada de aplicação com **Use Cases**, **DTOs** e **Controllers**;
- persistência e integração com **Prisma**;
- leitura com **CQRS (Query side)**;
- padronização de nomenclatura e estrutura de código.

## Pilares Arquiteturais

As skills deste repositório seguem estes pilares:

- **Domain-Driven Design (DDD)**
- **Clean Architecture**
- **Separation of Concerns** entre domínio, aplicação, interface e infraestrutura
- **Padronização de contratos e nomenclatura** para previsibilidade do código
- **Reuso de decisões arquiteturais** em múltiplos repositórios

## Estrutura de Skills

Principais skills disponíveis neste repositório:

- `config-project`: inicialização de monorepo com TurboRepo (web + backend)
- `config-new-module`, `config-shared-core` e `config-shared-frontend`: scaffolding de módulos/pacotes e shell web compartilhado
- `config-prisma`: setup inicial e padronização de Prisma no backend
- `module-entity`: modelagem de entidades de domínio
- `module-value-object`: criação de objetos de valor
- `module-domain-service`: regras de domínio transversais
- `module-use-case`: orquestração de regras de aplicação
- `module-dto`: contratos de entrada/saída e projeções
- `module-repository`: contratos e implementações de persistência
- `backend-prisma-data`: schema/migrações/adapters Prisma
- `module-query-cqrs`: consultas de leitura no padrão CQRS
- `backend-controller`: camada HTTP/NestJS

Também existem skills utilitárias para fluxo OpenSpec:

- `openspec-propose`
- `openspec-explore`
- `openspec-apply-change`
- `openspec-archive-change`

## Como usar como submódulo

Você pode instalar este repositório em `.agents` ou `.claude`, conforme o runtime/agente utilizado no projeto.

### Opção A: pasta `.agents`

```bash
git submodule add <URL-DESTE-REPOSITORIO> .agents/skills
git submodule update --init --recursive
```

### Opção B: pasta `.claude`

```bash
git submodule add <URL-DESTE-REPOSITORIO> .claude/skills
git submodule update --init --recursive
```

## Atualizar skills no projeto consumidor

Para atualizar o ponteiro do submódulo para a versão mais recente:

```bash
# Exemplo com .agents
cd .agents/skills
git checkout main
git pull origin main
cd -

git add .agents/skills
git commit -m "chore(skills): atualiza submódulo skills-ddd-clean"
```

> Se o submódulo estiver em `.claude`, ajuste o caminho nos comandos.

## Como contribuir com novas skills (a partir de outro projeto)

É possível evoluir as skills diretamente do repositório consumidor (onde o submódulo está instalado):

1. Entrar na pasta do submódulo.
2. Criar uma branch no repositório de skills.
3. Implementar/ajustar as skills.
4. Commitar e enviar para o remoto do repositório de skills.
5. Abrir PR e fazer merge.
6. Voltar ao projeto consumidor e atualizar o ponteiro do submódulo.

Exemplo:

```bash
cd .agents/skills
git checkout -b feat/nova-skill-ou-ajuste
# editar arquivos...
git add .
git commit -m "feat(skill): adiciona nova skill"
git push -u origin feat/nova-skill-ou-ajuste

# depois do merge no repo de skills
cd .agents/skills
git checkout main
git pull origin main
cd -
git add .agents/skills
git commit -m "chore(skills): aponta para nova versão"
```

## Configuração de namespace e padrões

A configuração é **do projeto consumidor**, não deste repositório de skills. Crie `skills.config.json` na raiz do
monorepo que usa as skills (modelo em `.env/skills.config.example.json`). Ordem de busca: raiz do projeto, depois
`.env/` do projeto. O diretório onde este repositório é montado nunca é consultado. Override local (gitignored):
`skills.config.local.json` no mesmo diretório. Precedência do namespace: `--scope` > `PROJECT_NAMESPACE`/`SKILLS_NAMESPACE` > local > versionado.

Nenhum namespace de projeto real deve ser versionado neste repositório; use placeholders (`@namespace`, `@my-org`).

Nos comandos documentados, `<SKILLS_DIR>` representa o diretório onde este repositório está montado no projeto
(`.agents/skills` ou `.claude/skills`, conforme a opção de instalação acima). Os scripts resolvem o próprio caminho
em runtime e funcionam em qualquer local.

Parâmetros principais disponíveis hoje:

- `namespace`: namespace dos packages do projeto (ex.: `@my-org`). Não se aplica ao shared, cujo nome é fixo: `@mentoria-360/shared`
- `sharedModulePath`: caminho relativo completo do módulo shared (ex.: `packages/shared`, `packages/common-shared`)
- `sharedSubmoduleUrl`: URL Git do submódulo shared (default: `https://github.com/mentoria-360/shared.git`)
- `frontendAppPath`: caminho relativo completo da app frontend (ex.: `apps/frontend`, `applications/front`)
- `backendAppPath`: caminho relativo completo da app backend (ex.: `apps/backend`, `services/api`)
- `frontendPort`: porta padrão da app frontend
- `backendPort`: porta padrão da app backend
- `frontendApiUrlEnvVar`: nome da env var de URL de API no frontend
- `backendPortEnvVar`: nome da env var de porta no backend

Convenção global de nomenclatura e padrões gerais:

- `<SKILLS_DIR>/skills-standards.md`

## Benefícios esperados

- consistência arquitetural entre projetos;
- menor tempo de setup e implementação;
- redução de divergências de naming e organização;
- evolução centralizada das práticas de DDD + Clean Architecture.