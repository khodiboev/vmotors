# Backend Migration: Nestar to VMotors

## Current Backend Summary

VMotors is now a NestJS GraphQL backend for a Korean new-car selling platform. The repository contains:

| App | Purpose |
| --- | --- |
| `apps/vmotors-api` | Main GraphQL/API application. |
| `apps/vmotors-batch` | Scheduled batch/ranking application. |

The active catalog domain is `Vehicle`, backed by the MongoDB `vehicles` collection. VMotors supports only new Hyundai and Kia vehicles.

## Completed Migration Stages

| Stage | Status |
| --- | --- |
| Visible app/package rename from Nestar to VMotors | Completed. |
| App folder/project key rename to `vmotors-api` and `vmotors-batch` | Completed. |
| Active catalog migration from property listings to vehicles | Completed. |
| Social module repointing for likes, views, comments, favorites, and visited vehicles | Completed. |
| Batch ranking migration from properties to vehicles | Completed. |
| MongoDB conversion from old `properties` documents | Not performed by decision. |

## Active Domain Shape

The active catalog API uses vehicle terminology only:

| Area | Current contract |
| --- | --- |
| Catalog module | `VehicleModule`, `VehicleResolver`, `VehicleService` |
| Catalog schema | `Vehicle.model.ts` with collection `vehicles` |
| Catalog DTOs | `libs/dto/vehicle/*` |
| Catalog GraphQL operations | `createVehicle`, `getVehicle`, `updateVehicle`, `getVehicles`, `getDealerVehicles`, `likeTargetVehicle`, admin vehicle operations |
| Seller/dealer ownership | `memberId` owned by `MemberType.AGENT` |
| Member catalog counter | `memberVehicles` |
| Batch vehicle ranking | `BATCH_TOP_VEHICLES` |

Vehicle fields include brand, model, trim, year, fuel, transmission, color, price, location, stock quantity, images, description, status, stats, seller/dealer, `soldAt`, and `deletedAt`.

## Domain Rules

| Rule | Current status |
| --- | --- |
| Keep `MemberType.USER`, `MemberType.AGENT`, `MemberType.ADMIN` | Preserved. |
| Only Hyundai and Kia brands | Enforced by `VehicleBrand`. |
| Only new car inventory | Active API has no used/rental/auction fields. |
| Product type | `ProductType.CAR` only. |
| Vehicle statuses | `AVAILABLE`, `RESERVED`, `SOLD`. |
| Removal behavior | Soft delete via `deletedAt`; there is no `DELETE` vehicle status. |
| Old property data | Not converted; old `properties` documents are legacy data. |

## Compatibility Notes

| Compatibility area | Status | Notes |
| --- | --- | --- |
| GraphQL catalog API | Breaking change accepted | Old property catalog operations were removed from active source. |
| MongoDB collections | New active collection | `vehicles` is active; legacy `properties` data was not migrated. |
| Member types/auth | Compatible | Member role names and auth behavior remain unchanged. |
| Social tables | Compatible table names | `likes`, `views`, and `comments` remain shared tables but use `VEHICLE` groups for catalog items. |
| Batch jobs | Renamed catalog job | Vehicle ranking uses `BATCH_TOP_VEHICLES`. |
| JWT/token signing | Compatible with existing secret | `SECRET_TOKEN` remains unchanged unless a later rotation is planned. |

## Validation Status

| Validation | Status |
| --- | --- |
| API typecheck | Passed: `npx tsc -p apps/vmotors-api/tsconfig.app.json --noEmit` |
| Batch typecheck | Passed: `npx tsc -p apps/vmotors-batch/tsconfig.app.json --noEmit` |
| Full Nest build | Passed: `npm run build` |
| Focused vehicle service test | Passed: `npm test -- vehicle.service.spec.ts` |
| Active source domain scan | Passed for property/real-estate/petshop/used-car terms under `apps/*/src` |
