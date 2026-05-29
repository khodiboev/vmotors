# Backend Migration: Nestar to VMotors

## Original Project Summary

Nestar was a NestJS GraphQL monorepo for a vehicle/property-style marketplace backend. The repository contained two Nest applications:

| Original app | Purpose |
| --- | --- |
| `apps/nestar-api` | Main GraphQL/API application, REST root health/greeting controller, WebSocket gateway, MongoDB-backed domain modules. |
| `apps/nestar-batch` | Scheduled batch application for maintenance and ranking jobs. |

The backend domain surface included members, authentication, properties, board articles, comments, follows, likes, views, notices, notifications, sockets, and batch ranking/rollback tasks.

## New Project Summary

The current backend identity is VMotors. The application layout now uses:

| Current app | Purpose |
| --- | --- |
| `apps/vmotors-api` | Main VMotors API application. |
| `apps/vmotors-batch` | VMotors batch/scheduler application. |

Package metadata now uses the package name `vmotors`, and Nest monorepo project IDs are `vmotors-api` and `vmotors-batch`.

## Backend Migration Goal

The migration completed in this session was a safe visible-identity rename. It changed project/app identification from Nestar to VMotors while preserving business logic and compatibility contracts.

Primary constraints:

| Constraint | Status |
| --- | --- |
| Do not change domain logic | Preserved. |
| Do not change GraphQL API shape | Preserved. |
| Do not rename MongoDB collections | Preserved. |
| Do not rewrite lint/format debt as part of rename | Preserved. |
| Update visible app/package/project names | Completed. |

## Naming Changes

| Area | Before | After |
| --- | --- | --- |
| API app folder | `apps/nestar-api` | `apps/vmotors-api` |
| Batch app folder | `apps/nestar-batch` | `apps/vmotors-batch` |
| Nest API project key | `nestar-api` | `vmotors-api` |
| Nest batch project key | `nestar-batch` | `vmotors-batch` |
| Package name | `nestars` | `vmotors` |
| API dist path | `dist/apps/nestar-api/main` | `dist/apps/vmotors-api/main` |
| Batch dist path | `dist/apps/nestar-batch/main` | `dist/apps/vmotors-batch/main` |
| API greeting | `Hello Nestar API server!` | `Hello VMotors API server!` |
| Batch greeting | `Hello Nestar Batch server!` | `Hello VMotors Batch server!` |

## Module Changes

No domain modules were added, removed, or behaviorally redesigned. Module paths changed because the app folders changed.

| Module group | Current location | Compatibility note |
| --- | --- | --- |
| Root API module | `apps/vmotors-api/src/app.module.ts` | Same Nest module role as before. |
| Components module | `apps/vmotors-api/src/components/components.module.ts` | Aggregates existing domain modules. |
| Auth/member/property/article/comment/follow/like/view modules | `apps/vmotors-api/src/components/*` | Domain behavior preserved. |
| Socket module/gateway | `apps/vmotors-api/src/socket/*` | Runtime role preserved. |
| API database module | `apps/vmotors-api/src/database/database.module.ts` | Connection selection behavior preserved. |
| Batch module/controller/service | `apps/vmotors-batch/src/*` | Scheduled batch behavior preserved. |
| Batch database module | `apps/vmotors-batch/src/database/database.module.ts` | Connection selection behavior preserved. |

Internal imports that referenced `apps/nestar-api` or `../../nestar-api` were updated to `apps/vmotors-api` or `../../vmotors-api`.

## GraphQL Changes

No GraphQL schema or operation contract rename was intentionally performed.

| GraphQL area | Migration status |
| --- | --- |
| Resolver classes and module responsibilities | Preserved. |
| Query/mutation names | Preserved. |
| DTO field names | Preserved. |
| Enum values | Preserved. |
| Authentication decorators/guards | Preserved except import paths. |
| Client compatibility | Existing clients should not need GraphQL operation changes for this backend rename. |

The current backend still exposes the same domain vocabulary, including `Member`, `Property`, `BoardArticle`, `Comment`, `Follow`, `Like`, and `View` DTOs.

## MongoDB Collection/Schema Changes

MongoDB collection names were intentionally not renamed.

| Schema file | Collection |
| --- | --- |
| `BoardArticle.model.ts` | `boardArticles` |
| `Comment.model.ts` | `comments` |
| `Like.model.ts` | `likes` |
| `Member.model.ts` | `members` |
| `Notice.model.ts` | `notices` |
| `Notification.model.ts` | `notifications` |
| `Property.model.ts` | `properties` |
| `View.model.ts` | `views` |

Mongoose feature registration names such as `Property`, `Member`, `Follow`, `Like`, and `View` were preserved.

The local `.env` currently points `MONGO_DEV` and `MONGO_PROD` at VMotors database URI paths. `SECRET_TOKEN` still contains `nestar_secret_token`, which is a compatibility-sensitive value and should not be changed without a token rotation plan.

## Compatibility Notes

| Compatibility area | Status | Notes |
| --- | --- | --- |
| REST root route | Compatible | Only greeting text changed. |
| GraphQL schema | Compatible | No intentional schema rename. |
| MongoDB collections | Compatible | Collection names unchanged. |
| Existing documents | Compatible | No migrations were introduced. |
| JWT/token signing | Compatible with existing secret | Secret value remains old unless rotated later. |
| Build output | Renamed | Deployment scripts must use `dist/apps/vmotors-api` and `dist/apps/vmotors-batch`. |
| Frontend clients | Mostly compatible | API endpoint/project labels may change, but GraphQL operations should continue to work. |

