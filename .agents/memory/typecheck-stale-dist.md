---
name: Stale lib declarations cause phantom type errors
description: Why an artifact-only typecheck can report errors (or miss them) that don't match the API spec/generated client.
---
Artifacts resolve `@workspace/*` lib types through project references, i.e. the compiled `.d.ts` in each lib's gitignored `dist/`. A plain `tsc -p` in an artifact never rebuilds those, so after spec/codegen changes it checks against old declarations — dozens of "property does not exist" errors even though the generated source is correct (and real breaks could be hidden the same way).

**Why:** a whole batch of "missing field" errors in the barbershop site turned out to be stale `dist/`, not an outdated spec; regenerating changed nothing.

**How to apply:** if type errors disagree with `lib/api-client-react/src/generated`, run `pnpm run typecheck:libs` (tsc --build) first. The barbershop typecheck script now builds its referenced libs itself; other artifacts' scripts still don't.
