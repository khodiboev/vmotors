# Completed Tasks

## Fix: Sold/Reserved Vehicles Leaking Into Recently Viewed and Favorites (2026-07-23)

**Symptom (reported from the frontend):** a vehicle that had been marked `SOLD` still showed up as a card in a member's Recently Viewed and (potentially) Saved Vehicles lists on the frontend, with a broken image, and clicking through to it landed on "vehicle not found" — because `getVehicle` correctly only serves `AVAILABLE` vehicles, but the two list endpoints behind those pages did not apply the same filter.

**Root cause:** `ViewService.getVisitedVehicles` (`components/view/view.service.ts`) and `LikeService.getFavoriteVehicles` (`components/like/like.service.ts`) both filtered their `$lookup`'d vehicle only by `deletedAt: { $exists: false }` — no `vehicleStatus` check. Once a vehicle transitioned to `SOLD` (or `RESERVED`), it stayed permanently visible in anyone's view/favorite history as a dead link. This contradicts the migration's own stated intent that "public listings show available non-deleted vehicles" (see the Session Summary below, "Vehicle behavior" row) — `getVehicle` and the main `getVehicles` list already enforced that; these two aggregations were the gap.

| Area | Change |
| --- | --- |
| `view.service.ts` | `$match` after the vehicle `$lookup`/`$unwind` now also requires `vehicleStatus: VehicleStatus.AVAILABLE`, matching `getVehicle`'s existing rule. |
| `like.service.ts` | Same fix, same shape, for the favorites aggregation. |
| Data | No documents changed. Sold vehicles remain in the database untouched — they are simply excluded from these two list queries going forward, same as they already were from the main catalog listing. |

**Validation:**
- `npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit` — passed.
- Live verification against real data: found the exact vehicle and member from the frontend report by querying `db.views.findOne({ viewRefId: <vehicleId> })` directly in MongoDB to get the real `memberId`, then called `getVisited` with that member's own credentials before and after — their list dropped from 16 entries (including the sold vehicle) to 15, all `AVAILABLE`.
- The running `nest start --watch` process picked up both file changes without crashing.

**Not changed:** `getVehicle`, `getVehicles` (main public list, already correct), vehicle schema, GraphQL contracts, DTOs, any resolver signatures.

---

## Frontend Community UI Update Note (2026-07-10)

This documentation note records the latest frontend Community work for backend context only.

| Area | Status |
| --- | --- |
| Backend files | No backend changes in this update. |
| Backend logic | No backend changes in this update. |
| GraphQL/API contracts | Unchanged. Existing `LIKE_TARGET_BOARD_ARTICLE` behavior, board-article APIs, and social modules were preserved. |
| Frontend Community grid | Updated in the frontend repo from a 2-column desktop article grid to a 3-column desktop grid, with tablet 2-column and mobile 1-column responsive behavior. |
| Frontend article card overflow | Article descriptions now clamp to 2 lines with ellipsis; titles remain clamped and card footers remain aligned. |
| Frontend article-like feedback | Board-article like/unlike success feedback now uses a local Santa-themed animated floating card instead of the previous top-right SweetAlert success toast. |
| Feedback copy | The frontend feedback now shows "Article liked" and "Article unliked". |

**Backend note:** No resolver, service, schema, DTO, database, cache, mutation, query, route, pagination, or API behavior changed. This was a frontend UI-only Community/article feedback update.

---

## Session Summary

This session completed the backend catalog migration from property listings to Santa vehicles. The active GraphQL API now uses vehicle operations, the active MongoDB catalog collection is `vehicles`, and social/batch/member counters were repointed to vehicle terminology.

## Completed Refactors

| Area | Completed work |
| --- | --- |
| Catalog module | Replaced active `PropertyModule` with `VehicleModule`, `VehicleResolver`, and `VehicleService`. |
| GraphQL operations | Added vehicle-only catalog operations including create, read, update, list, dealer list, favorite/visited, like, and admin vehicle operations. |
| DTO/schema layer | Uses existing `libs/dto/vehicle/*` and `Vehicle.model.ts`; removed active property DTO/schema/source files. |
| Enums | Added `ProductType.CAR`; kept requested vehicle enum values unchanged. |
| Member counter | Renamed active catalog count to `memberVehicles` in member schema and DTO. |
| Social modules | Updated like/view/comment/notification groups from `PROPERTY` to `VEHICLE`; favorites and visited now return vehicles. |
| Vehicle behavior | Public listings show available non-deleted vehicles; dealer/admin views exclude soft-deleted vehicles; removal uses `deletedAt`. |
| Batch app | Registered `VehicleSchema`, renamed top catalog job to `BATCH_TOP_VEHICLES`, and ranked vehicles plus agents using `memberVehicles`. |
| Tests | Added focused `VehicleService` unit coverage for create, sold status timestamping, and admin soft delete counter behavior. |
| Docs | Updated backend migration, decisions, completed tasks, and next steps docs for the vehicle-only API decision. |

## Validation Status

| Validation | Status |
| --- | --- |
| API typecheck | Passed: `npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit` |
| Batch typecheck | Passed: `npx tsc -p apps/vmotors-batch/tsconfig.app.json --noEmit` |
| Full build | Passed: `npm run build` |
| Focused test | Passed: `npm test -- vehicle.service.spec.ts` |
| Active source domain scan | Passed for property/real-estate/petshop/used-car terms under `apps/*/src` |

## Known Non-Goals

| Non-goal | Status |
| --- | --- |
| Convert existing `properties` documents | Not performed by decision. |
| Keep property GraphQL aliases | Not performed by decision. |
| Rename `MemberType.AGENT` | Not performed; dealer ownership still uses `AGENT`. |
| JWT/token secret rotation | Not performed. |
| Mass lint cleanup | Not performed. |

## Frontend Migration Progress

| Area | Completed work |
| --- | --- |
| Contract layer | Added frontend vehicle enums/types and updated Apollo catalog operations to the vehicle-only backend API. |
| Public catalog | Added /vehicle and /vehicle/detail pages; old /property routes now redirect to vehicle routes. |
| Vehicle UI | Converted list/detail cards, search filters, favorites, visited, dealer inventory, and member inventory views to vehicle fields. |
| Dealer workflow | Replaced add/edit property form with vehicle inventory form using brand, model, trim, year, fuel, transmission, color, price, location, stock, images, and description. |
| Admin inventory | Added /_admin/vehicles with vehicle status/brand/location filtering plus admin update/remove vehicle operations; old admin properties route redirects. |
| Branding | Updated visible Nestar/property wording to Santa/vehicle/dealer in core navigation, metadata, footer, locale labels, and account copy. |

## Frontend Validation Status

| Validation | Status |
| --- | --- |
| Typecheck | Passed: `yarn -s tsc --noEmit --incremental false` |
| Production build | Passed: `yarn build` |
| Lint | Blocked: `yarn lint` opens Next.js ESLint setup prompt because no ESLint config exists. No lint config was generated during migration. |

## Frontend Known Follow-ups

| Follow-up | Notes |
| --- | --- |
| Visual assets | Some reused CSS class names and real-estate image assets remain as compatibility/polish debt after the functional vehicle migration. |
| Route naming | Dealer routes still use /agent internally because backend/member role compatibility keeps AGENT; visible copy now says dealer. |

---

## Homepage UI Redesign (2026-06-09)

### Summary
Significant UI redesign of the Santa homepage. All existing GraphQL/Apollo logic, queries, mutations, routing, and data structures were preserved. Only the UI layer was changed.

### New Components Created

| Component | Path | Purpose |
| --- | --- | --- |
| BrandSection | `libs/components/homepage/BrandSection.tsx` | Hyundai & Kia brand feature cards with navigation to filtered vehicle listings |
| TrustSection | `libs/components/homepage/TrustSection.tsx` | 4-card trust/benefits section (replaces irrelevant tourism Events section) |
| CTASection | `libs/components/homepage/CTASection.tsx` | Full-width CTA strip encouraging users to browse vehicles or find a dealer |

### Modified Files

| File | Change |
| --- | --- |
| `libs/components/layout/LayoutHome.tsx` | Added premium hero headline, subtext, and brand pill overlay on the hero section |
| `pages/index.tsx` | Added BrandSection (first), replaced Events with TrustSection, added CTASection before CommunityBoards |
| `libs/components/homepage/TrendProperties.tsx` | Updated copy: "Trending Now" / "Most liked vehicles this week" |
| `libs/components/homepage/PopularProperties.tsx` | Updated copy: "Most Popular" / "Top viewed vehicles right now"; fixed broken `/property` link → `/vehicle` |
| `libs/components/homepage/TopProperties.tsx` | Updated copy: "Top Rated" / "Highest ranked listings on Santa" |
| `libs/components/homepage/TopAgents.tsx` | Updated copy: "Our Top Dealers" / "Certified Santa dealer partners" / "Browse All Dealers" |
| `scss/pc/main.scss` | Added `.hero-content` styles (hero-pill, hero-headline, hero-sub) positioned as absolute overlay on the header |
| `scss/pc/homepage/homepage.scss` | Added styles for BrandSection, TrustSection, CTASection; improved vehicle card hover effects; upgraded section heading typography |

### New Homepage Section Order
1. Hero (LayoutHome) — premium headline + FiberContainer + HeaderFilter
2. BrandSection — Hyundai / Kia brand cards
3. TrendProperties — "Trending Now"
4. PopularProperties — "Most Popular"
5. Advertisement — video (unchanged)
6. TopProperties — "Top Rated"
7. TopAgents — "Our Top Dealers"
8. TrustSection — Why Choose Santa (replaces Events)
9. CTASection — CTA strip
10. CommunityBoards — (desktop only)

### Validation

| Validation | Status |
| --- | --- |
| TypeScript (`yarn tsc --noEmit`) | Passed — no new errors in modified files |
| Pre-existing errors | Only in `skills/shadcn-ui/examples/` (unrelated to this task) |

---

## Homepage Polish, Stabilization, and Audit Update (2026-06-11)

### Summary
This follow-up session audited the current Santa homepage implementation against the migration docs and confirmed that the shipped homepage has moved beyond the original 2026-06-09 redesign notes. The live homepage keeps all GraphQL/Apollo logic intact while adding stronger Santa vehicle/dealer copy, premium hero and filter polish, normalized dealer cards, refined vehicle-card presentation, section-level entrance motion, and cleaner mobile/desktop parity.

### Completed Work

| Area | Completed work |
| --- | --- |
| Homepage composition | `pages/index.tsx` now renders `BrandSection` → `TrendProperties` → `TopProperties` → `TopAgents` → `Advertisement` → `TrustSection` → `CommunityBoards` → `CTASection` on both desktop and mobile. `PopularProperties` remains in the repo but is no longer mounted on the home route. |
| Hero section | `LayoutHome.tsx` now uses premium Santa hero copy, trust chips, and a desktop side panel to frame Hyundai/Kia discovery as a modern automotive marketplace rather than a generic property portal. |
| Search/filter UX | `HeaderFilter.tsx` now presents brand, fuel, and transmission as the primary homepage search controls, routes directly to `/vehicle?input=...`, and uses Framer Motion for premium entrance/stagger polish without changing query behavior. |
| New Arrivals section | `TrendProperties.tsx` now ships as `New Arrivals` with updated Santa copy, preserved vehicle query logic, and once-on-reveal staggered entrance animation via Framer Motion plus reduced-motion handling. |
| Buyer Favorites section | `TopProperties.tsx` now ships as `Buyer Favorites` with updated shortlist-focused copy, preserved vehicle query/like logic, and the same once-on-reveal motion treatment and reduced-motion support used in `TrendProperties`. |
| Vehicle card system | `HomepageVehicleCard.tsx` now provides the shared homepage vehicle presentation: top-rank and brand badges, price chip, status pill, location row, spec chips, inventory/dealer metadata, and a cleaner engagement strip for likes/views. |
| Trusted Dealers section | `TopAgents.tsx` and `TopAgentCard.tsx` now ship a centered `Trusted Dealers` section with equal-height premium cards, normalized support-line fallback copy, image cover handling, 2-column stats panels, bottom-aligned CTA links, and centered glyph-based carousel controls that preserve the existing Swiper disabled state. |
| Advertisement/video section | `Advertisement.tsx` now uses premium automotive overlay copy and a direct CTA over the existing homepage video rather than leaving the section as a generic unframed media block. |
| Built for confident buyers | `TrustSection.tsx` now replaces the old irrelevant events/tourism-style content with four Santa trust pillars focused on verified inventory, Hyundai/Kia specialization, smarter search, and trusted dealer support. |
| CTA conversion block | `CTASection.tsx` now closes the homepage with a branded Santa CTA encouraging users to browse vehicles or find dealers without changing route behavior. |
| Community polish | `CommunityBoards.tsx` and `HomepageCommunityCard.tsx` now present news and owner-story content in homepage-specific Santa styling so editorial/community content matches the upgraded automotive landing-page system. |
| Styling and responsiveness | `scss/pc/homepage/homepage.scss`, `scss/pc/main.scss`, and `scss/mobile/main.scss` now define a shared navy/blue premium-tech homepage token set, premium hero/search presentation, updated responsive section spacing, vehicle/dealer card polish, and matching mobile treatments. |
| Motion and accessibility | Homepage vehicle sections now respect `prefers-reduced-motion: reduce` for section reveal motion, dealer carousel controls include explicit `aria-label`s, and section/card wrappers were structured to avoid horizontal overflow or broken equal-height card layouts. |

### Affected Files

| File | Role in the completed homepage work |
| --- | --- |
| `pages/index.tsx` | Final homepage composition and current section order |
| `libs/components/layout/LayoutHome.tsx` | Hero shell, metadata, trust chips, and desktop side panel |
| `libs/components/homepage/HeaderFilter.tsx` | Premium vehicle search shell and Framer Motion search/filter entrance |
| `libs/components/homepage/BrandSection.tsx` | Hyundai/Kia entry cards and brand-specific browse routing |
| `libs/components/homepage/TrendProperties.tsx` | `New Arrivals` vehicle section copy and reveal motion |
| `libs/components/homepage/TopProperties.tsx` | `Buyer Favorites` vehicle section copy and reveal motion |
| `libs/components/homepage/HomepageVehicleCard.tsx` | Shared homepage vehicle-card design system |
| `libs/components/homepage/TopAgents.tsx` | Trusted Dealers section composition and desktop controls |
| `libs/components/homepage/TopAgentCard.tsx` | Normalized dealer-card content, stats, and CTA |
| `libs/components/homepage/Advertisement.tsx` | Video overlay copy and CTA |
| `libs/components/homepage/TrustSection.tsx` | Built for confident buyers section |
| `libs/components/homepage/CTASection.tsx` | Homepage closing conversion CTA |
| `libs/components/homepage/CommunityBoards.tsx` | Community/news homepage section polish |
| `libs/components/homepage/HomepageCommunityCard.tsx` | Homepage article-card design |
| `libs/components/homepage/PopularProperties.tsx` | Preserved in source but currently unused on `pages/index.tsx` |
| `scss/pc/main.scss` | Desktop hero/search shell styling |
| `scss/pc/homepage/homepage.scss` | Desktop homepage tokens, section polish, card systems, motion wrapper styles |
| `scss/mobile/main.scss` | Mobile homepage hero/search, card, section, and motion-wrapper styling |

### Design Decisions

| Decision | Reason |
| --- | --- |
| Keep all homepage data behavior unchanged | Homepage redesign/polish remains a UI-layer migration only; Apollo queries, mutations, props, and data shapes were preserved. |
| Use Framer Motion only where it already exists in the project | Motion polish was added without introducing new dependencies and stayed consistent with the existing homepage search/filter implementation. |
| Animate only `TrendProperties` and `TopProperties` on viewport reveal | These were the two manually polished vehicle sections targeted for premium motion without redesigning the rest of the homepage. |
| Keep `SwiperSlide` structure intact and wrap cards inside it | This preserved Swiper sizing/overflow behavior while allowing stretch-safe animated card containers. |
| Normalize dealer support copy with a fallback line | Dealer cards needed consistent height and tone without expanding the GraphQL contract to add a dedicated tagline field. |
| Preserve `PopularProperties` in source but remove it from the active home composition | The current homepage prioritizes brand entry, new arrivals, buyer favorites, trusted dealers, trust proof, and CTA flow over the older “most popular” section. |

### Implementation Notes for Future Agents

| Note | Details |
| --- | --- |
| Current homepage labels supersede the 2026-06-09 note | The active shipped titles are `New Arrivals`, `Buyer Favorites`, and `Trusted Dealers`, not the earlier `Trending Now`, `Top Rated`, or `Our Top Dealers` wording documented in the older section. |
| Current homepage order supersedes the 2026-06-09 note | `PopularProperties` is no longer rendered on the current home route even though the component still exists in source. |
| Vehicle-section motion is section-scoped | The reveal wrappers live in `TrendProperties.tsx` and `TopProperties.tsx`; shared `HomepageVehicleCard.tsx` structure was preserved. |
| Desktop/mobile homepage styling is split | Desktop logic is concentrated in `scss/pc/homepage/homepage.scss` and hero/search shell rules in `scss/pc/main.scss`, while mobile homepage presentation lives in `scss/mobile/main.scss`. |
| Frontend migration docs are partly historical | `FRONTEND_MIGRATION.md` still reflects an earlier planning phase and no longer matches the existence or current state of this frontend repository. |

### Validation Status

| Validation | Status |
| --- | --- |
| Frontend typecheck | Baseline unchanged: `yarn -s tsc --noEmit --incremental false` still fails only in `skills/shadcn-ui/examples/*` and did not expose new homepage-specific errors during this audit. |
| Homepage route composition audit | Passed: `pages/index.tsx` confirms the current live homepage order and verifies that `PopularProperties` is no longer mounted. |

---

## Community Page Auth Guard + Article Detail Redesign (2026-07-02)

### Summary
Fixed the "Write Article" guest redirect bug and redesigned the Community Article Detail page to match the Santa premium design language.

### Write Article Auth Guard

| Change | Detail |
| --- | --- |
| `pages/community/index.tsx` | Added `useReactiveVar(userVar)` and `writeArticleHandler`. Both `<Link>` write-article buttons replaced with `<button onClick={writeArticleHandler}>`. Guests see `sweetLoginConfirmAlert` and stay on the page; confirmed guests go to `/account/join`; logged-in users go to `/mypage?category=writeArticle`. |
| `pages/community/detail.tsx` | Write button onClick updated with the same auth-guarded pattern. `sweetLoginConfirmAlert` added to imports. |

### Article Detail Page Redesign

| Change | Detail |
| --- | --- |
| `libs/components/layout/LayoutBasic.tsx` | Fixed banner subtitle for `/community/detail`: `'Home / Vehicles'` → `'Community / Article Detail'`. |
| `pages/community/detail.tsx` | Removed old sidebar (`.left-config` with SANTA logo image + vertical tabs). Added horizontal `.article-category-nav` strip with `Tabs` (reusing existing `tabChangeHandler`) and an auth-guarded "Write article" button. Restructured content into three premium cards: `.article-header-card` (gradient hero with category badge, title, author row, stats chips), `.article-body-card` (conditional featured image, ToastViewerComponent, like button), `.article-comments-card` (comment input, comment list, pagination). Moved `<Backdrop>` edit modal outside the comment loop. Removed unused MUI imports (`Stack`, `Typography`) and icon (`ChatIcon`). Removed unused state (`anchorEl`, `open`, `id`) and unused query destructuring variables. |
| `scss/pc/community/detail.scss` | Complete rewrite using the Santa CSS custom property token set (`--cd-primary`, `--cd-secondary`, `--cd-soft`, `--cd-surface`, `--cd-border`, `--cd-shadow`, `--cd-muted`, `--cd-text`). Premium gradient article header card matching vehicle/agent detail page style, clean article body card, comment cards with avatar/name/date/actions, styled edit modal with focus ring and contained-button CTA. |

### Validation

| Validation | Status |
| --- | --- |
| TypeScript typecheck | Passed: `yarn -s tsc --noEmit --incremental false` — no new errors introduced. |

---

## MyPage Polish (2026-07-02)

### Summary
Incremental UI polish across the MyPage module. No GraphQL/Apollo logic, routing, auth, or SCSS structure changed. All changes are CSS-class and display-layer fixes only.

### Changes

| File | Change |
| --- | --- |
| `libs/components/community/Teditor.tsx` | Removed all inline `style={{...}}` from the fields row Stack (`margin: '40px'`), Typography labels (`color: '#7f838d', margin: '10px'`), FormControl (`background: 'white'`), TextField (`width: '300px', background: 'white'`), and submit Button (`margin: '30px', width: '250px', height: '45px'`). Replaced with CSS class names: `editor-fields-row`, `form-field`, `field-label`, `field-input`, `editor-submit-btn`. |
| `scss/pc/mypage/writeArticle.scss` | Full premium rewrite. Removed fragile MUI class selector (`.css-guvl2y-MuiButtonBase-root-MuiButton-root`) and old `#87cdf9` brand colors. Added styling for `.editor-fields-row` (soft blue card, joined to editor canvas), `.form-field`, `.field-label` (uppercase muted label), `.field-input` (white background, rounded), `.editor-submit-btn` (gradient navy-to-blue button with hover lift). |
| `scss/pc/mypage/addNewProperty.scss` | Replaced two occurrences of `#eb6753` (old Nestar orange) with `var(--dashboard-secondary)`: upload box dashed border (line 243) and submit button background (line 369). |
| `libs/components/mypage/MyProperties.tsx` | Fixed raw enum display in Current Status Filter metric card — changed `{searchFilter.search.vehicleStatus}` to formatted readable label (e.g., "Available", "Reserved", "Sold") with nullish fallback to "All". |
| `libs/components/mypage/MyArticles.tsx` | Updated stale subtitle from "We are glad to see you again!" to "Manage and track your published community articles." Updated heading from "Article" to "My Articles". |

### Validation

| Validation | Status |
| --- | --- |
| TypeScript typecheck | Passed: `yarn -s tsc --noEmit --incremental false` — no new errors introduced. |
