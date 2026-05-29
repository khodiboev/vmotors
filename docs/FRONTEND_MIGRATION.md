# Frontend Migration Plan: Nestar to VMotors

## Context

No Next.js frontend repository is present in this workspace. This plan is inferred from the backend modules and expected frontend areas.

The backend GraphQL contract was not intentionally renamed during the backend migration. The frontend should first update visible identity, route labels, component names, file names, and client-side GraphQL operation names while continuing to call the same backend GraphQL fields.

## Step-by-Step Plan

| Step | Task | Output |
| --- | --- | --- |
| 1 | Search the frontend repo for `Nestar`, `nestar`, `nestars`, `nestar-api`, and old asset names. | Complete inventory of visible identity usage. |
| 2 | Update environment labels and API endpoint names to VMotors. | `.env*` examples and runtime configs use VMotors labels. |
| 3 | Rename app shell branding: metadata, title, nav logo text, footer, auth screens, notifications. | Users see VMotors branding consistently. |
| 4 | Rename frontend folders/components where they include Nestar identity. | Source tree no longer exposes old project identity. |
| 5 | Keep backend GraphQL field names stable, but rename frontend operation aliases/files where useful. | Cleaner VMotors client code without breaking API calls. |
| 6 | Review terminology for business domain. | Decide whether domain remains property/agent-based or evolves toward VMotors vehicle terms. |
| 7 | Run frontend validation. | Typecheck, lint, build, key page smoke tests. |

## Inferred Page and Component Mapping

| Nestar frontend area | VMotors target | Backend module backing it | Notes |
| --- | --- | --- | --- |
| Home/landing | VMotors home | `AppResolver`, `AppController` | Update metadata, hero copy, and root status labels. |
| Auth login/signup | VMotors auth | `AuthModule`, `MemberModule` | Keep token flow unchanged unless backend token rotation is planned. |
| Member profile | VMotors member profile | `MemberModule` | Preserve `Member` GraphQL type usage. |
| Agent directory | VMotors sellers/dealers or members | `MemberModule` | UI terminology needs product decision before renaming GraphQL types. |
| Property listings | VMotors listings | `PropertyModule` | Backend still uses `Property`; frontend can display "listings" or "vehicles" while calling existing fields. |
| Property detail | VMotors listing detail | `PropertyModule`, `ViewModule`, `LikeModule`, `CommentModule` | Keep `property*` fields until backend schema migration. |
| Board articles/blog | VMotors articles/news | `BoardArticleModule` | Rename UI copy; keep `BoardArticle` GraphQL type. |
| Comments | VMotors comments | `CommentModule` | No API rename required. |
| Follow/following | VMotors follows | `FollowModule` | Preserve social graph behavior. |
| Likes/favorites | VMotors favorites | `LikeModule` | UI can prefer "favorites"; GraphQL can remain likes. |
| Views/recently viewed | VMotors viewed listings | `ViewModule` | Keep backend view tracking unchanged. |
| Notices/notifications | VMotors alerts/notifications | `Notice`, `Notification` schemas | Confirm frontend routes when repo is available. |
| Admin/batch status | VMotors operations | `vmotors-batch` | Only needed if the frontend exposes operational status. |

## GraphQL Query and Mutation Rename Plan

Do not rename backend GraphQL schema fields in the frontend migration. Rename only client-side operation names, generated hook names, filenames, and aliases if the frontend tooling supports that safely.

| Current backend contract | Frontend rename approach | Compatibility |
| --- | --- | --- |
| `Member` type and member operations | Rename operation files from Nestar/member branding to VMotors/member branding. | Safe if GraphQL field names stay unchanged. |
| `Property` type and property operations | UI may call these "listings"; keep `property*` field access. | Safe. |
| `BoardArticle` type and article operations | Rename UI copy to articles/news; keep backend type. | Safe. |
| `Comment`, `Follow`, `Like`, `View` | Rename component labels only where needed. | Safe. |
| Auth mutations and token handling | Keep backend mutation names and token storage keys unless explicitly migrated. | Safe. |

Example pattern:

| Before | After |
| --- | --- |
| `NestarPropertyList.tsx` | `VMotorsListingList.tsx` |
| `GET_NESTAR_PROPERTIES` | `GET_VMOTORS_LISTINGS` as a client-side operation name, still querying the same backend fields |
| UI label `Nestar Properties` | UI label `VMotors Listings` |

## UI Terminology Changes

| Old UI term | VMotors UI term | Backend contract |
| --- | --- | --- |
| Nestar | VMotors | No backend schema change. |
| Nestar API | VMotors API | App/project label only. |
| Property | Listing, vehicle listing, or inventory item | Backend still uses `Property`. |
| Agent | Seller, dealer, or member | Backend still uses `Member` and agent-related sort names. |
| Favorite property | Favorite listing | Backend lookup names remain unchanged. |
| Board article | Article or news post | Backend still uses `BoardArticle`. |

## Validation Checklist

| Check | Expected result |
| --- | --- |
| Search old branding | No visible Nestar branding remains except compatibility comments if intentionally kept. |
| GraphQL codegen | Generated types still compile against unchanged backend schema. |
| Next.js typecheck | Passes. |
| Next.js lint | Passes or known unrelated lint debt is documented. |
| Production build | Passes. |
| Smoke tests | Auth, listing browse/detail, comments, likes, follows, profile, and article pages work. |

