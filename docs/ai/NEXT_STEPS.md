# Next Steps

## Priority Order

| Priority | Workstream | Task | Outcome |
| --- | --- | --- | --- |
| 1 | Homepage follow-through | Decide whether `PopularProperties` should be restored intentionally or removed as an unused homepage section/component. | The homepage section inventory matches the intended Santa landing-page strategy with no dead-section drift. |
| 2 | Frontend accessibility | Add reduced-motion handling to the hero/search shell and audit clickable non-link card surfaces for keyboard/focus accessibility. | The premium homepage remains accessible without losing the current design direction. |
| 3 | Frontend QA | Run desktop/mobile smoke tests against the live Santa frontend and backend for homepage, `/vehicle`, dealer, and community entry flows. | Homepage polish is validated beyond typecheck and code inspection. |
| 4 | Backend/data policy | Decide whether old member counts or old social rows need backfills into `memberVehicles` and `VEHICLE` groups. | Clear legacy data handling policy. |
| 5 | Backend cleanup | Audit CI/CD, process manager configs, Dockerfiles, and hosting settings for old Nestar or property catalog references. | Deployment path and runtime compatibility confirmed. |
| 6 | Environment policy | Decide whether `.env` database URI names and `SECRET_TOKEN` should be migrated or documented as compatibility exceptions. | Clear environment/secret policy. |

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
| Treat `FRONTEND_MIGRATION.md` as historical and refresh it when a new planning pass is needed. | Medium | The current file still reflects an early planning phase before the live frontend repo and homepage redesign/polish work were completed. |
| Decide the final status of `PopularProperties`. | High | The component still exists and queries data, but `pages/index.tsx` no longer renders it. Either remove the dead section cleanly or reintroduce it intentionally elsewhere. |
| Add homepage smoke coverage. | High | Cover hero search, `New Arrivals`, `Buyer Favorites`, `Trusted Dealers`, video CTA, community links, and mobile/desktop responsive behavior. |
| Accessibility audit for homepage interactions. | High | Prioritize brand cards, CTA buttons, autoplay video fallback/poster behavior, and reduced-motion parity between hero/search and section-level motion. |
| Visual cleanup pass for leftover compatibility debt. | Medium | Audit reused real-estate asset fallbacks, old route/class naming leftovers, and any UI copy that still reads like a migration artifact instead of a final Santa surface. |
| Consolidate repeated homepage motion/polish patterns if more sections adopt them. | Medium | `TrendProperties` and `TopProperties` currently own their own motion wrappers/variants; future work may justify extracting shared helpers after behavior stabilizes. |

## Homepage Implementation Notes

| Note | Why it matters |
| --- | --- |
| Current active home route order is `BrandSection` → `TrendProperties` → `TopProperties` → `TopAgents` → `Advertisement` → `TrustSection` → `CommunityBoards` → `CTASection`. | Older docs still mention a different section order that included `PopularProperties`. |
| `TrendProperties` and `TopProperties` already use Framer Motion plus reduced-motion handling. | Additional homepage animation work should stay consistent with the current one-time viewport reveal pattern and avoid redundant animation systems. |
| `TopAgents` already has a dedicated premium card treatment. | Future dealer-section work should preserve equal-height cards, fallback support copy, and the current desktop 4-up Swiper behavior. |
| Shared homepage vehicle styling is centralized in `HomepageVehicleCard.tsx` and homepage SCSS. | Section-specific polish should stay scoped to avoid unintentionally changing other homepage or listing surfaces. |

## Validation Commands

| Task | Command |
| --- | --- |
| Frontend typecheck | `yarn -s tsc --noEmit --incremental false` |
| Frontend production build | `yarn build` |
| API typecheck | `npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit` |
| Batch typecheck | `npx tsc -p apps/vmotors-batch/tsconfig.app.json --noEmit` |
| Full build | `npm run build` |
| Focused vehicle test | `npm test -- vehicle.service.spec.ts` |
| Active source domain scan | `rg -n --no-ignore --hidden --glob '!node_modules' --glob '!dist' --glob '!build' --glob '!coverage' --glob '!.git' -i "property|properties|real estate|real-estate|petshop|petoria|used-car|second-hand|rental|auction" apps/vmotors-api/src apps/vmotors-batch/src` |
