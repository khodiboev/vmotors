# VMotors Backend Agent Instruction

VMotors is a NestJS GraphQL monorepo migrated from Real estate platform into a Korean new car selling platform.

## Read First

Before changing code, read the current AI handoff docs:

- `docs/BACKEND_MIGRATION.md`
- `docs/DECISIONS.md`
- `docs/COMPLETED_TASKS.md`
- `docs/NEXT_STEPS.md`

Use those files as the source of truth for AI Agent related migration history, accepted decisions, remaining work and validation status.

## Project Shape

- Backend apps are `vmotors-api` and `vmotors-batch`.
- Keep the existing NestJS resolver/service/module pattern based on MVC and DI.
- Keep DTOs, enums, schemas under `apps/vmotors-api/src/libs`.
- Keep shared modules reusable: auth, member, like, view, comment, follow, board article, socket.

## Domain Rules

- Use VMotors/vehicle/car terminology for the main catalog entity.
- VMotors sells only NEW cars in South Korea.
- Only Hyundai and Kia brands are supported.
- Do not reintroduce property, real-estate, petshop, Petoria or used-car fields.
- Keep `MemberType.USER`, `MemberType.AGENT` and `MemberType.ADMIN` unchanged.
- Vehicle ownership continues to use `MemberType.AGENT` unless a later migration explicitly changes it.
- Do not introduce rental, auction, used-car, second-hand or real-estate logic.

Product/vehicle enum values are:

- `ProductType`: `CAR`
- `VehicleBrand`: `HYUNDAI`, `KIA`
- `VehicleFuel`: `GASOLINE`, `DIESEL`, `HYBRID`, `ELECTRIC`, `LPG`
- `VehicleTransmission`: `AUTOMATIC`, `MANUAL`
- `VehicleStatus`: `AVAILABLE`, `RESERVED`, `SOLD`

Main vehicle fields should include:

- `brand`
- `model`
- `trim`
- `year`
- `fuel`
- `transmission`
- `color`
- `price`
- `location`
- `stockQuantity`
- `images`
- `description`
- `seller/dealer`

## Workflow

1. Analyze before editing.
2. Keep changes small and consistent with existing project patterns.
3. Do not remove working logic unless it is replaced safely.
4. Preserve existing CRUD, auth, search, filter, like, view, comment and member logic where possible.
5. Replace old domain terminology step by step: real estate/petshop terms → VMotors vehicle terms.
6. Update `docs/COMPLETED_TASKS.md` after major completed work.
7. Update `docs/DECISIONS.md` when a domain or architecture decision is accepted.
8. Add or update focused tests when behavior changes.

## Validation

Use these checks for backend work:

```bash
npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit
npx tsc -p apps/vmotors-batch/tsconfig.app.json --noEmit
npm run build
```

`npm run lint` runs ESLint with `--fix`, so use it only when file rewriting is acceptable