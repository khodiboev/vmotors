# Migration Decisions

## Architectural Decisions

| Decision | Why it was made | Risk | Alternative |
| --- | --- | --- | --- |
| Perform a safe identity rename only | The requested migration was branding/project identification, not business behavior. | Some old domain words may remain where they are part of API contracts. | Full domain redesign, which would require schema, database, and client migrations. |
| Rename app folders and Nest project IDs | `nestar-api` and `nestar-batch` were visible project identifiers. | Deploy scripts, CI, and local commands must be updated to new paths. | Keep old folders and only change greetings/package name. |
| Rename package metadata to `vmotors` | Package name is visible project identity and appears in lockfile/tooling. | Any automation expecting `nestars` must be updated. | Use a scoped name such as `@vmotors/backend`. |
| Preserve GraphQL query/mutation/DTO names | Keeps frontend and external API consumers compatible. | UI may still see domain terms such as `Property` until a separate API migration is planned. | Rename GraphQL types and operations, requiring frontend and possibly persisted query updates. |
| Preserve MongoDB collection names | Avoids data migration risk and keeps existing documents readable. | Collection names remain generic marketplace terms rather than brand-specific terms. | Rename collections with a migration script and rollback plan. |
| Preserve token secret until explicit rotation | Changing `SECRET_TOKEN` can invalidate active tokens. | Secret still contains the old `nestar` string. | Rotate tokens with planned logout/session invalidation. |
| Install `typescript-eslint` to satisfy the flat ESLint config | Existing lint config imported `typescript-eslint`, but the helper package was missing. | Package versions now include the v8 helper while legacy `@typescript-eslint/*` v6 entries remain declared. | Rewrite ESLint config to use only the existing v6 parser/plugin imports. |
| Avoid mass lint cleanup | Lint reported hundreds of existing formatting/type-safety issues unrelated to the rename. | Lint remains failing until cleanup is scheduled. | Run `eslint --fix` and manually address all remaining lint issues in a dedicated cleanup task. |

## Compatibility Decisions

| Contract | Decision | Rationale |
| --- | --- | --- |
| GraphQL API | Keep stable | Reduces frontend migration scope and protects existing clients. |
| MongoDB collections | Keep stable | Avoids data copy/rename risk. |
| Mongoose schema names | Keep stable | Prevents model registration side effects. |
| Batch job names | Keep stable | Batch constants are operational identifiers, not brand labels. |
| Runtime env secrets | Keep stable unless explicitly rotated | Secrets are behavior-affecting, not just visible copy. |

## Risks to Track

| Risk | Impact | Mitigation |
| --- | --- | --- |
| CI scripts still call old app IDs | Build/deploy failure | Search CI/deploy repos for `nestar-api`, `nestar-batch`, and `nestars`. |
| Frontend hardcodes old app labels | User-visible stale branding | Run a frontend-wide search for `Nestar`, `nestar`, and old route labels. |
| Lint debt obscures rename regressions | Harder code review and future maintenance | Address lint cleanup separately after the rename is accepted. |
| Secret rotation is deferred | Old brand string remains in `.env` | Create a dedicated token rotation task with rollout notes. |
| Database URI target changed locally | Environment may point at a new database | Confirm intended database names per environment before production deployment. |

