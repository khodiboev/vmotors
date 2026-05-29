# Reusable Prompts

## Useful Prompts From This Session

```text
Safe rename Layer (No business logic change)
Rename all visible project/app identification from Nestar to VMotors. Do not change domain logic. Keep APIs and database collection unchanged. Update package names, environment labels/constants. Run lint and typecheck after refactoring. Please make plan first.
```

```text
Create a new folder: docs
Inside it, generate BACKEND_MIGRATION.md, DECISIONS.md, FRONTEND_MIGRATION.md, COMPLETED_TASKS.md, NEXT_STEPS.md, and PROMPTS.md.
Use everything completed and discussed in this Codex session.
Do not change application source code. Only create documentation files.
Be precise and technical. Use markdown tables where useful.
```

## Next Session: Documentation Review

```text
Review docs/*.md for technical accuracy against the current VMotors backend repo.
Do not change application source code.
Verify app names, scripts, GraphQL compatibility notes, MongoDB collection names, validation status, and next-step priorities.
Update only documentation if anything is stale.
```

## Next Session: Frontend Migration Planning

```text
Inspect the Next.js frontend repository and create a concrete Nestar to VMotors migration plan.
First search for Nestar/nestar/nestars references, frontend route names, GraphQL operation files, environment variables, UI labels, and assets.
Do not change backend code.
Produce a file-by-file plan that preserves backend GraphQL compatibility unless a schema migration is explicitly requested.
```

## Next Session: Frontend Migration Implementation

```text
Implement the approved Next.js frontend Nestar to VMotors rename.
Keep backend GraphQL field names unchanged.
Rename visible UI copy, metadata, assets, route labels, component names, operation names, and environment labels where safe.
Run frontend lint, typecheck, build, and smoke-test key pages.
```

## Next Session: Lint Cleanup

```text
Clean up backend ESLint failures as a dedicated task separate from the VMotors rename.
Start by running npx eslint "{src,apps,libs,test}/**/*.ts".
Group fixes by category: Prettier formatting, unused imports, unsafe any/type-safety, floating promises, and enum comparisons.
Avoid business logic changes unless required to satisfy type safety, and explain any behavior-affecting changes before applying them.
```

## Next Session: GraphQL Compatibility Audit

```text
Audit the VMotors backend GraphQL schema for compatibility after the Nestar rename.
Generate or inspect the schema, list all queries, mutations, object types, inputs, enums, and field names.
Confirm that no GraphQL operation names changed during the app identity rename.
Document any old Nestar-visible names and classify them as API contract, UI terminology, or safe-to-rename later.
```

## Next Session: Environment and Secret Policy

```text
Review .env and deployment environment variables for the VMotors backend.
Do not print secrets in full.
Classify each old-brand value as safe label, database target, token secret, or external integration setting.
Create a rotation/migration plan for SECRET_TOKEN if the old Nestar value must be removed.
```

## Next Session: Final Brand Audit

```text
Run a final repository-wide brand audit for Nestar to VMotors.
Search source, tests, docs, configs, scripts, and ignored files separately.
Do not change database collection names, GraphQL contracts, or secrets without an explicit plan.
Return a table of remaining references with recommended action: keep, rename now, migrate later, or rotate.
```

