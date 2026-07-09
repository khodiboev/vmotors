import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { VehicleBrand, VehicleFuel, VehicleTransmission } from '../../enums/vehicle.enum';

@InputType()
export class VehicleInput {
	@IsNotEmpty()
	@Field(() => VehicleBrand)
	vehicleBrand!: VehicleBrand;

	@IsNotEmpty()
	@Length(1, 100)
	@Field(() => String)
	vehicleModel!: string;

	@IsNotEmpty()
	@Length(1, 100)
	@Field(() => String)
	vehicleTrim!: string;

	@IsNotEmpty()
	@IsInt()
	@Min(1900)
	@Field(() => Int)
	vehicleYear!: number;

	@IsNotEmpty()
	@Field(() => VehicleFuel)
	vehicleFuel!: VehicleFuel;

	@IsNotEmpty()
	@Field(() => VehicleTransmission)
	vehicleTransmission!: VehicleTransmission;

	@IsNotEmpty()
	@Length(1, 50)
	@Field(() => String)
	vehicleColor!: string;

	@IsNotEmpty()
	@Min(0)
	@Field(() => Number)
	vehiclePrice!: number;

	@IsNotEmpty()
	@Length(1, 100)
	@Field(() => String)
	vehicleLocation!: string;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	vehicleStockQuantity!: number;

	@IsNotEmpty()
	@Field(() => [String])
	vehicleImages!: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	vehicleDesc?: string;

	@IsOptional()
	@Length(1, 100)
	@Field(() => String, { nullable: true })
	vehicleBodyType?: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	vehicleMileage?: number;

	memberId!: ObjectId;
}
