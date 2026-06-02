# Next Steps

## Priority Order

| Priority | Workstream | Task | Outcome |
| --- | --- | --- | --- |
| 1 | Frontend migration | Update frontend GraphQL operations and field names from property catalog calls to vehicle catalog calls. | Clients work with the vehicle-only backend API. |
| 2 | Data policy | Decide whether old member counts or old social rows need backfills into `memberVehicles` and `VEHICLE` groups. | Clear legacy data handling policy. |
| 3 | Testing | Run backend e2e tests against a safe VMotors database/test environment. | Runtime behavior confirmed beyond typecheck/build/unit tests. |
| 4 | Backend cleanup | Audit CI/CD, process manager configs, Dockerfiles, and hosting settings for old Nestar or property catalog references. | Deployment path and runtime compatibility confirmed. |
| 5 | Environment policy | Decide whether `.env` database URI names and `SECRET_TOKEN` should be migrated or documented as compatibility exceptions. | Clear environment/secret policy. |

## Backend Cleanup

| Task | Priority | Notes |
| --- | --- | --- |
| Add optional backfill for `memberVehicles` if old counts matter. | High | Current migration intentionally does not convert old `properties` data. |
| Add optional cleanup/migration for old `PROPERTY` likes/views/comments if preserving legacy social history matters. | Medium | Current active API uses `VEHICLE` groups only. |
| Review MongoDB indexes for `likes` and `views`. | Medium | Schema now indexes `{ memberId, group, refId }`; live DBs may still have old two-field unique indexes. |
| Run `npm run test:e2e` after confirming database/test environment safety. | High | E2E may connect to configured MongoDB. |
| Audit external CI/CD and hosting scripts. | High | External scripts are not visible in this workspace. |
| Decide on JWT secret rotation. | Medium | Changing `nestar_secret_token` invalidates active tokens. |
| Plan lint cleanup separately. | Medium | `npm run lint` runs ESLint with `--fix`, so do not mix with migration review. |

## Frontend Migration

| Task | Priority | Notes |
| --- | --- | --- |
| Replace property GraphQL operation names with vehicle operation names. | High | Backend no longer exposes active property catalog operations. |
| Replace property field access with vehicle fields. | High | Use brand, model, trim, year, fuel, transmission, color, price, location, stock quantity, images, description, and status. |
| Replace member catalog counter usage with `memberVehicles`. | High | `memberProperties` is no longer active backend terminology. |
| Update favorite/visited/comment UI terminology to vehicles. | Medium | Shared operation names `getFavorites` and `getVisited` remain, but return `Vehicles`. |
| Confirm only Hyundai/Kia new-car inventory is exposed in UI filters. | Medium | Match backend enum constraints. |

## Validation Commands

| Task | Command |
| --- | --- |
| API typecheck | `npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit` |
| Batch typecheck | `npx tsc -p apps/vmotors-batch/tsconfig.app.json --noEmit` |
| Full build | `npm run build` |
| Focused vehicle test | `npm test -- vehicle.service.spec.ts` |
| Active source domain scan | `rg -n --no-ignore --hidden --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!coverage' --glob '!.git' -i "property|properties|real estate|real-estate|petshop|petoria|used-car|second-hand|rental|auction" apps/vmotors-api/src apps/vmotors-batch/src` |
