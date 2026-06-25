---
name: vehicle-logic
description: Review Santa vehicle API consistency across GraphQL operations, DTOs, schemas, enums, filters, and remaining legacy terminology.
---

# Santa Vehicle API Review

Use this skill for review-only passes or pre-edit analysis of the vehicle API.

## Review Checklist

- Confirm GraphQL operation names use vehicle terminology:
  - `createVehicle`
  - `updateVehicle`
  - `getVehicle`
  - `getVehicles`
  - and where it is related

- Confirm shared operations such as `getFavorites` and `getVisited` return vehicle data.

- Confirm DTOs, schemas, and enums agree on vehicle fields and nullability.

- Confirm filters use vehicle fields such as:
  - brand
  - model
  - price
  - year
  - fuel
  - transmission
  - location
  - vehicleStatus

- Confirm only Hyundai and Kia brands are supported.

- Confirm only NEW vehicles are supported.

- Confirm no legacy real-estate or petshop terminology remains.

- Report real findings with paths and behavior impact.