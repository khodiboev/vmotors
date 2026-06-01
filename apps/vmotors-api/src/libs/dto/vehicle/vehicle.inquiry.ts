import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { Direction } from '../../enums/common.enum';
import { VehicleBrand, VehicleFuel, VehicleStatus, VehicleTransmission } from '../../enums/vehicle.enum';

const availableVehicleSorts = [
	'createdAt',
	'updatedAt',
	'vehicleLikes',
	'vehicleViews',
	'vehicleRank',
	'vehiclePrice',
	'vehicleYear',
];

@InputType()
export class VehiclePricesRange {
	@Field(() => Int)
	start!: number;

	@Field(() => Int)
	end!: number;
}

@InputType()
export class VehicleYearsRange {
	@Field(() => Int)
	start!: number;

	@Field(() => Int)
	end!: number;
}

@InputType()
export class VehiclePeriodsRange {
	@Field(() => Date)
	start!: Date;

	@Field(() => Date)
	end!: Date;
}

@InputType()
export class VehicleSearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId?: string;

	@IsOptional()
	@Field(() => [VehicleBrand], { nullable: true })
	brandList?: VehicleBrand[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	modelList?: string[];

	@IsOptional()
	@Field(() => [VehicleFuel], { nullable: true })
	fuelList?: VehicleFuel[];

	@IsOptional()
	@Field(() => [VehicleTransmission], { nullable: true })
	transmissionList?: VehicleTransmission[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	locationList?: string[];

	@IsOptional()
	@Field(() => VehiclePricesRange, { nullable: true })
	pricesRange?: VehiclePricesRange;

	@IsOptional()
	@Field(() => VehicleYearsRange, { nullable: true })
	yearsRange?: VehicleYearsRange;

	@IsOptional()
	@Field(() => VehiclePeriodsRange, { nullable: true })
	periodsRange?: VehiclePeriodsRange;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class VehiclesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availableVehicleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => VehicleSearch)
	search!: VehicleSearch;
}

@InputType()
export class DealerVehicleSearch {
	@IsOptional()
	@Field(() => VehicleStatus, { nullable: true })
	vehicleStatus?: VehicleStatus;
}

@InputType()
export class DealerVehiclesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availableVehicleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => DealerVehicleSearch)
	search!: DealerVehicleSearch;
}

@InputType()
export class AllVehicleSearch {
	@IsOptional()
	@Field(() => VehicleStatus, { nullable: true })
	vehicleStatus?: VehicleStatus;

	@IsOptional()
	@Field(() => [VehicleBrand], { nullable: true })
	vehicleBrandList?: VehicleBrand[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	vehicleLocationList?: string[];
}

@InputType()
export class AllVehiclesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@IsIn(availableVehicleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AllVehicleSearch)
	search!: AllVehicleSearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;
}
