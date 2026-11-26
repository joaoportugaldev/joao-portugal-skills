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
- The shared package name is fixed: `@mentoria-360/shared` (`SHARED_PACKAGE_NAME` in `utils/resolve-skill-config.mjs`).
  It is an external submodule with its own scope and must never be derived from the project namespace.

## 6. Quick Examples

- Backend controller: `apps/backend/src/modules/customer/customer.controller.ts`
- Backend module: `apps/backend/src/modules/customer/customer.module.ts`
- Frontend component: `apps/frontend/src/modules/customer/components/customer-dashboard.component.tsx`
- Frontend context: `apps/frontend/src/shared/context/shell.context.tsx`
- Frontend hook: `apps/frontend/src/shared/hooks/shell.hook.ts`
- Domain entity: `modules/customer/src/customer/model/customer.entity.ts`
- Domain VO: `modules/customer/src/customer/model/customer-name.vo.ts`
