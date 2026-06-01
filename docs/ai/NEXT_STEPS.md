# Next Steps

## Priority Order for Tomorrow

| Priority | Workstream | Task | Outcome |
| --- | --- | --- | --- |
| 1 | Backend cleanup | Review all CI/deploy/runtime scripts outside this workspace for old `nestar-api`, `nestar-batch`, and `nestars` references. | Deployment path compatibility confirmed. |
| 2 | Testing | Run backend e2e tests against the VMotors app paths and current `.env`. | Confirms runtime behavior beyond typecheck/build. |
| 3 | Backend cleanup | Decide whether `.env` database URI names and `SECRET_TOKEN` should be migrated or documented as compatibility exceptions. | Clear environment policy. |
| 4 | Frontend migration | Locate the Next.js frontend repo and run the branding inventory. | Concrete frontend rename map replaces inferred plan. |
| 5 | Documentation | Update these docs with actual frontend file paths once the frontend repo is available. | Docs stay authoritative. |

## Backend Cleanup

| Task | Priority | Notes |
| --- | --- | --- |
| Audit CI/CD, process manager configs, Dockerfiles, and hosting settings for old app names. | High | Not visible in this workspace. |
| Run `npm run test:e2e` after confirming database/test environment safety. | High | E2E may connect to configured MongoDB. |
| Decide on JWT secret rotation. | Medium | Changing `nestar_secret_token` invalidates active tokens. |
| Decide whether database name `VMotors` is final per environment. | Medium | Avoid accidental production data split. |
| Normalize ESLint dependency declarations. | Medium | `typescript-eslint` v8 was added to load the flat config; legacy v6 parser/plugin entries should be reviewed. |
| Plan lint cleanup separately. | Medium | Do not mix with rename review. |

## Frontend Migration

| Task | Priority | Notes |
| --- | --- | --- |
| Find Next.js frontend repository and branch. | High | No frontend exists in this backend workspace. |
| Search for `Nestar`, `nestar`, `nestars`, `nestar-api`, and old asset names. | High | Build exact change list. |
| Update app metadata, layout, nav, footer, and auth branding to VMotors. | High | Visible user-facing identity first. |
| Rename frontend components/files with Nestar identity. | Medium | Keep imports and route aliases stable during transition. |
| Rename client-side GraphQL operation names only. | Medium | Do not change backend GraphQL field names yet. |
| Review terminology shift from `Property` to listing/vehicle language. | Medium | Requires product decision before backend API rename. |

## Testing

| Task | Priority | Command or check |
| --- | --- | --- |
| API typecheck | High | `npx tsc --noEmit -p apps/vmotors-api/tsconfig.app.json` |
| Batch typecheck | High | `npx tsc --noEmit -p apps/vmotors-batch/tsconfig.app.json` |
| API build | High | `npx nest build vmotors-api` |
| Batch build | High | `npx nest build vmotors-batch` |
| Identity scan | High | `rg -n --no-ignore --hidden --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!coverage' --glob '!.git' -i "nestar" .` |
| Lint cleanup validation | Medium | `npx eslint "{src,apps,libs,test}/**/*.ts"` |
| Frontend build | Medium | Run in frontend repo after migration. |

## Documentation

| Task | Priority | Notes |
| --- | --- | --- |
| Keep migration docs updated with validation results. | High | Especially e2e and deployment checks. |
| Add frontend-specific file maps after frontend repo inspection. | High | Current frontend plan is inferred from backend modules. |
| Document final environment policy. | Medium | Include database names and token rotation decision. |
| Add release notes for operators. | Medium | Include new app IDs and dist paths. |

