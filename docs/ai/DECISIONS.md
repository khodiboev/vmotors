# Migration Decisions

## Architectural Decisions

| Decision | Why it was made | Risk | Alternative |
| --- | --- | --- | --- |
| Use a vehicle-only catalog API | Santa is now a Korean new-car selling platform, and the ERD defines `vehicles` as the catalog entity. | Frontend clients must update old property GraphQL calls. | Keep temporary property aliases. |
| Do not migrate old `properties` documents | Real-estate fields do not map safely to new Hyundai/Kia inventory fields. | Old property documents remain legacy data outside the active API. | Build a one-time converter with explicit field mapping. |
| Keep `MemberType.USER`, `MemberType.AGENT`, and `MemberType.ADMIN` | Existing auth and ownership rules depend on these roles. | `AGENT` still means vehicle dealer until a later naming migration. | Rename `AGENT` to dealer, requiring broader auth/client changes. |
| Use `memberVehicles` for dealer catalog count | The ERD and vehicle domain replace `memberProperties`. | Existing member documents need the new field initialized or backfilled if old counts matter. | Keep `memberProperties` as a compatibility field. |
| Use `deletedAt` for vehicle removal | `VehicleStatus` intentionally supports only `AVAILABLE`, `RESERVED`, and `SOLD`. | Admin removal is a soft delete, not a status transition. | Add a `DELETE` status, which would violate the accepted enum set. |
| Keep shared social collections | Likes, views, comments, and notifications remain reusable cross-domain tables. | Existing old rows with `PROPERTY` groups are legacy rows. | Create dedicated vehicle-only social collections. |
| Preserve token secret until explicit rotation | Changing `SECRET_TOKEN` can invalidate active tokens. | Secret still contains the old `nestar` string. | Rotate tokens with planned logout/session invalidation. |
| Avoid mass lint cleanup | Lint debt predates this migration and `npm run lint` rewrites files. | Lint remains a separate cleanup track. | Run ESLint `--fix` and manually address all debt in this migration. |

## Compatibility Decisions

| Contract | Decision | Rationale |
| --- | --- | --- |
| GraphQL catalog API | Breaking vehicle-only change accepted | The current backend should expose Santa vehicle terminology, not property aliases. |
| MongoDB catalog collection | Use `vehicles` | The ERD defines `vehicles` as the active inventory collection. |
| MongoDB legacy property data | Do not convert | No safe field mapping was accepted. |
| Member roles | Keep stable | Avoids auth and authorization churn. |
| Social groups | Use `VEHICLE` | Keeps likes/views/comments reusable while making catalog references explicit. |
| Runtime env secrets | Keep stable unless explicitly rotated | Secrets are behavior-affecting, not just visible copy. |

## Risks to Track

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Frontend still calls property operations | Client breakage | Update frontend GraphQL operations to vehicle names and vehicle DTO fields. |
| Existing member documents lack `memberVehicles` | Ranking/count displays may start at zero or undefined for old data. | Add a small admin/backfill task only if old counts must be preserved. |
| Existing likes/views/comments with `PROPERTY` groups remain | Legacy social rows will not appear in vehicle favorites/visited/comments. | Treat as legacy unless a data migration is explicitly accepted. |
| Existing unique indexes on likes/views may not include group | A live database may still enforce old `{ memberId, refId }` uniqueness. | Review/drop/recreate old indexes during deployment if needed. |
| CI/deploy scripts still call old app IDs | Build/deploy failure | Search external CI/deploy repos for old Nestar app names. |
| Secret rotation is deferred | Old brand string remains in `.env` | Create a dedicated token rotation task with rollout notes. |
