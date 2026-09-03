---
name: backend-migration
description: Continue the Santa backend migration from Nestar property concepts to Santa new vehicle concepts while preserving the existing NestJS architecture.
---

# Santa Backend Migration

Use this skill when changing backend code for the Santa vehicle migration.

## Workflow

1. Search for affected property/product/vehicle references before editing.
2. Preserve the resolver/service/module structure already used by `vmotors-api`.
3. Keep DTOs, enums, and schemas in their existing folders.
4. Keep `MemberType.USER`, `MemberType.AGENT`, and `MemberType.ADMIN` unchanged.
5. Use vehicle terminology for catalog behavior and database lookups.
6. Support only new Hyundai and Kia vehicles.
7. Do not introduce used-car, rental, auction, real-estate, petshop, or Petoria logic.
8. Update social modules consistently when vehicle counters, likes, views, comments, or notifications are involved.
9. Update batch logic when vehicle ranking or `memberProducts` affects rank calculations.
10. Update `docs/COMPLETED_TASKS.md` after major completed work.