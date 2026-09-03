## Santa Backend

Santa is the NestJS GraphQL backend for a Hyundai and Kia new-car marketplace in South Korea. The monorepo contains:

- `apps/vmotors-api` for the main GraphQL API
- `apps/vmotors-batch` for scheduled ranking jobs

## Project Setup

```bash
npm install
```

## Compile and Run the Project

```bash
# development API
npm run start

# watch mode
npm run start:dev

# batch watch mode
npm run start:dev:batch

# production mode
npm run start:prod
```

## Validation

```bash
npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit
npx tsc -p apps/vmotors-batch/tsconfig.app.json --noEmit
npm run build
```

## Core Domain

- Vehicle catalog lives in the `vehicles` collection
- Seller ownership still uses `MemberType.AGENT` for compatibility
- Supported brands are Hyundai and Kia only
- Social modules include likes, views, comments, follows, and community articles

## Notes

- Preserve GraphQL contracts and database models unless a change is explicitly branding-only.
- Migration history and accepted decisions live in `docs/ai`.
