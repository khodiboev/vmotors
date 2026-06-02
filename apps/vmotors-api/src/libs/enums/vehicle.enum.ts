import { registerEnumType } from '@nestjs/graphql';

export enum ProductType {
	CAR = 'CAR',
}
registerEnumType(ProductType, {
	name: 'ProductType',
});

export enum VehicleBrand {
	HYUNDAI = 'HYUNDAI',
	KIA = 'KIA',
}
registerEnumType(VehicleBrand, {
	name: 'VehicleBrand',
});

export enum VehicleFuel {
	GASOLINE = 'GASOLINE',
	DIESEL = 'DIESEL',
	HYBRID = 'HYBRID',
	ELECTRIC = 'ELECTRIC',
	LPG = 'LPG',
}
registerEnumType(VehicleFuel, {
	name: 'VehicleFuel',
});

export enum VehicleTransmission {
	AUTOMATIC = 'AUTOMATIC',
	MANUAL = 'MANUAL',
}
registerEnumType(VehicleTransmission, {
	name: 'VehicleTransmission',
});

export enum VehicleStatus {
	AVAILABLE = 'AVAILABLE',
	RESERVED = 'RESERVED',
	SOLD = 'SOLD',
}
registerEnumType(VehicleStatus, {
	name: 'VehicleStatus',
});
