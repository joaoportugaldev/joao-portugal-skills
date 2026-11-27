# Skills Standards

## Purpose

Centralize global standards used by all project skills.
Use these rules as default when creating or updating files via automation scripts.

## 1. Naming Pattern

Default format for custom files:

- `<name-in-kebab-case>.<type>.<extension>`

Examples:

- `admin-shell.component.tsx`
- `shell.context.tsx`
- `shell.hook.ts`
- `customer.vo.ts`
- `customer.entity.ts`
- `customer.controller.ts`

Base rules:

- Folders: lowercase + kebab-case.
- Filenames: lowercase + kebab-case.
- Domain/module names: lowercase + kebab-case.

## 2. Recommended Type Suffixes

- UI component (React): `.component.tsx`
- App/feature page component: `.page.tsx`
- React context: `.context.tsx`
- Hook: `.hook.ts`
- Utility/helper: `.util.ts`
- DTO: `.dto.ts`
- Value object: `.vo.ts`
- Entity: `.entity.ts`
- Enum: `.enum.ts` (nome em kebab-case; símbolo em PascalCase com sufixo `Enum`)
- Use case: `.use-case.ts`
- Repository: `.repository.ts`
- Query (CQRS): `.query.ts`
- Persistence mapper: `.mapper.ts` (ex.: `reserva.mapper.ts`, classe `ReservaMapper`)
- Service: `.service.ts`
- Controller (Nest): `.controller.ts`
- Module (Nest): `.module.ts`
- Prisma model file: `.model.prisma`

## 3. Framework and Library Exceptions

Exceptions are allowed when naming is imposed by framework/library:

- Next.js App Router: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, etc.
- Tool entrypoints/config files that require fixed names.
- Imported/copied Shadcn component files can keep original upstream naming.

## 4. Structural Conventions

- Prefer feature/domain folders in kebab-case.
- Keep shared, reusable frontend artifacts under `src/shared` when applicable.
- Keep script output deterministic and idempotent.
- Keep imports by alias (`@/...`) when configured in the project.

## 4.1 Module structure

Domain packages use per-feature folders with `dto/`, `model/`, `provider/`, and `use-case/`. Backend adapters live in the Nest app module (for example `*.prisma.ts`). Frontend modules use flat `data/` files (`*.api.ts`, `*.schema.ts`, `use-*.ts`) and `providers/` for session/state.

## 4.2 One declaration per file

Each source file in a domain package exports one main declaration, and the filename names it
(`pedido-listado.dto.ts` exports `PedidoListadoDTO`). This applies to DTOs, port interfaces
(`*.provider.ts`, `*.query.ts`, `*.repository.ts`), value objects, enums and services.

Allowed exceptions (the only ones):

- `XxxProps` is declared in the same file as its entity (`xxx.entity.ts`).
- `XxxIn` and `XxxOut` are declared in the same file as their use case (`xxx.use-case.ts`), because they are
  the input and output of that use case. No other type is declared there.
  Each `XxxIn` declares all of its own fields: do not create an interface or DTO to share fields between the
  inputs of different use cases, and do not make one `XxxIn` extend another, even when the fields repeat.
- The input type of a query is declared in the same file as the query (`xxx.query.ts`), because it is the
  input of that query. It is named after the query with the suffix `In`: `ListagemPedidosQuery` receives
  `ListagemPedidosQueryIn`. Do not name it `XxxFiltroDTO` or `XxxDTO`. A small input may be written inline
  (`Query<{ id: string }, PedidoDTO | null>`). The output of a query is always a DTO in `dto/`.
- `index.ts` barrels re-export several symbols.

Consequences:

- Any other input, output or projection type used by a port is a DTO: it lives in `dto/`, in its own
  `*.dto.ts` file, and the port file imports it. A `*.provider.ts` or `*.repository.ts` file contains only
  the port interface; a `*.query.ts` file contains the query interface and, at most, its input type.
- A type needed by more than one file is never declared inline in one of them.
- These rules also apply when refactoring existing code: moving code to the new structure includes
  splitting files that hold several declarations.

## 4.3 Reuse the shared package

Before declaring a base type, contract or value object, check what the shared package already exports
(read its `README.md`). What exists there is imported, never redeclared or wrapped in a local alias
inside a module or aggregate. This includes pagination (`PaginatedInputDTO`, `PaginatedResultDTO<T>`,
`PaginationMetaDTO`), `Result`, `UseCase`, `Entity`, `ValueObject`, repository contracts and shared VOs.
When the shared contract does not fit, change the shared package or raise the gap; do not create a local variant.

## 4.4 Failures use Result

Domain and application code report expected failures with `Result` from the shared package, following its
`README.md`. A domain package does not declare error classes (`class XxxError extends Error`), does not
declare its own helpers to convert between exceptions and `Result`, and does not `throw` across the
boundary of a use case, port or entity method. The only exceptions thrown are the ones the shared package
itself defines (`create`, `validator.throwsIf*`), and only inside `Result.try`/`Result.tryAsync`.
Failure codes are strings in the `entidade.motivo` format (for example `pedido.acesso-negado`).

Domain and application code does not write `try`/`catch`. Ports return `Result`, so a use case only checks
`isFailure`. When a step must not let an unexpected exception escape (for example, an external system has
already accepted the operation and the local state has to record it), move that step to a private method and
call it through `Result.tryAsync(() => this.step(...))`, then handle the failed `Result`. `try`/`catch`
belongs to backend adapters, which translate the exceptions of a technology into `Result`.

When a change stops emitting a failure code, delete its constant in the same change, after confirming with a
search that nothing else references it.

A failure carries only its codes. Do not attach the rejected value, the class name, the use case name or
any other context to it; when refactoring code that did (`lancar(codigo, valor, extras)`), drop that context.

When the caller needs data to decide its next step (for example, which items require confirmation), the
operation has not failed. Model it as a successful result: `XxxOut` is a union discriminated by a `status`
field, each variant carrying its own data, and the use case returns `Result.ok(...)` for every variant. The
controller answers with a success status and the outcome in the body; the client reads `status` to decide
what to do next.

## 4.5 No facades and no converters

An aggregate does not declare a `Facade` or an `adapters/` folder. Each use case is a public entry point,
built in the composition root and injected directly into the controller, worker or adapter that calls it.
A facade method that is not a use case becomes a use case when it applies rules, or a query when it only reads.

An aggregate does not declare converter classes or inject converters into use cases. A conversion lives with
the owner of the data: `static toDTO` on the entity; a method or getter on the value object; a domain service
when several use cases share the rule; the use case itself when the shaping is specific to its output. Rows
and external contracts are translated by backend mappers and provider adapters.

## 4.6 Services, helper files and persistence results

- A domain service is a class named `XxxService` in `service/xxx.service.ts`, with static methods when it
  holds no state. A `*.service.ts` file does not export loose functions, and a service is not re-exported
  through the barrel of another folder (such as `enums/index.ts`).
- A domain package has no `*.util.ts` files. A helper used by more than one use case is a domain service;
  a helper used by a single use case is a private method of that use case.
- In backend adapters every file has a type suffix. A file that only exports helper functions for the
  adapters (reading rows, building a page, extracting the actor from the request) is named `<name>.util.ts`.
  A name without a type suffix (`paginacao-pedidos.ts`) or with only the technology (`paginacao-pedidos.knex.ts`)
  is not allowed.

## 4.7 What crosses a port is data

Everything that crosses a port (use case, query, repository, provider) is data: `XxxIn`/`XxxOut`,
`XxxQueryIn` or a DTO. Entities and value objects do not cross ports, neither as input nor as output.

- A query returns `Result` of a DTO. A repository command receives a DTO and returns `Result<void>` or
  `Result` of a DTO. No port method receives or returns an entity.
- A repository may expose `findById(id)`, returning `Result` of the state DTO or `null`. It belongs to the
  command context: a use case that changes the aggregate uses it to load the state it will validate and
  change. It is the only read allowed in a repository; listings, filters, projections and existence checks
  are queries.
- A `BuscarXxxPorIdQuery` (`*.query.ts`) serves the read context: a use case such as `obter-xxx-por-id`,
  whose whole job is to return the data. A read use case does not depend on the repository.
- A use case that already receives the repository of an entity loads that entity with the repository's
  `findById`; it does not also receive a query by ID for the same entity. A write use case may receive a
  query by ID for another reason, for example to read an entity whose repository it does not receive.
- When a use case needs the entity, it loads the state (`repository.findById` in a write use case) and
  rebuilds it with `Entidade.tryCreate(dto)`.
- The DTO handed to a write command is always produced by the entity (`Entidade.toDTO(entidade)`), never an
  object literal assembled in the use case. This keeps every persisted state validated by `tryCreate`.
- The main DTO of an aggregate is the DTO of its entity: it extends the entity's `XxxProps`, it is what
  `Entidade.toDTO` produces, what `findById` returns and what the write commands receive. It is named with the
  entity name plus `DTO` and nothing else: entity `Pedido`, DTO `PedidoDTO`, file `pedido.dto.ts`. Do not add
  words such as `Estado`, `Completo` or `Dados` (`PedidoEstadoDTO`). Every other DTO is named after the set of
  data it carries (`PedidoListadoDTO`, `ResumoPedidoDTO`) and never takes the plain `<Entidade>DTO` name.
- Backend adapters do not build entities: the mapper has `toTable(dto)` and `toDTO(row)`, and no `toDomain`.
- Inside the domain, entities, value objects and domain services exchange model objects. An entity method
  returns `Result` of the entity; a domain service may receive an entity or a value object.

## 5. Skill Authoring Rules

When editing any skill (`*/SKILL.md`):

- Reference this file (`./skills-standards.md`) as global standard source.
- Document explicit exceptions in the skill itself when needed.
- If a skill generates files via script, enforce this standard in generated paths.

### 5.1 Portability rules (install location and namespaces)

- Never hardcode the install location of this repository. In docs and usage text, write `<SKILLS_DIR>` (the directory
  where the skills submodule is mounted, e.g. `.claude/skills` or `.agents/skills`). Scripts must resolve their own
  location at runtime (`import.meta.url` / `__dirname`), never via a fixed path.
- Project configuration (`skills.config.json`) belongs to the consuming repository (its root or `.env/`), never inside
  this repository. Only `.env/skills.config.example.json` is versioned here.
- Never commit a real project namespace (scope) in scripts, assets, or docs. Use placeholders (`@namespace`, `@my-org`)
  or template tokens (`__AUTH_PACKAGE_NAME__`, `__SHARED_PACKAGE_NAME__`, `__PROJECT_SCOPE_SLUG__`).
- The shared package name is fixed: `@poiesis/shared` (`SHARED_PACKAGE_NAME` in `utils/resolve-skill-config.mjs`).
  It is an external submodule with its own scope and must never be derived from the project namespace.

## 6. Quick Examples

- Backend controller: `apps/backend/src/modules/customer/customer.controller.ts`
- Backend module: `apps/backend/src/modules/customer/customer.module.ts`
- Frontend component: `apps/frontend/src/modules/customer/components/customer-dashboard.component.tsx`
- Frontend context: `apps/frontend/src/shared/context/shell.context.tsx`
- Frontend hook: `apps/frontend/src/shared/hooks/shell.hook.ts`
- Domain entity: `modules/customer/src/customer/model/customer.entity.ts`
- Domain VO: `modules/customer/src/customer/model/customer-name.vo.ts`
