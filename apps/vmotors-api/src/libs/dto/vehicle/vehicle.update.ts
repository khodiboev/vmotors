import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { VehicleBrand, VehicleFuel, VehicleStatus, VehicleTransmission } from '../../enums/vehicle.enum';

@InputType()
export class VehicleUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

	@IsOptional()
	@Field(() => VehicleBrand, { nullable: true })
	vehicleBrand?: VehicleBrand;

	@IsOptional()
	@Length(1, 100)
	@Field(() => String, { nullable: true })
	vehicleModel?: string;

	@IsOptional()
	@Length(1, 100)
	@Field(() => String, { nullable: true })
	vehicleTrim?: string;

	@IsOptional()
	@IsInt()
	@Min(1900)
	@Field(() => Int, { nullable: true })
	vehicleYear?: number;

	@IsOptional()
	@Field(() => VehicleFuel, { nullable: true })
	vehicleFuel?: VehicleFuel;

	@IsOptional()
	@Field(() => VehicleTransmission, { nullable: true })
	vehicleTransmission?: VehicleTransmission;

	@IsOptional()
	@Length(1, 50)
	@Field(() => String, { nullable: true })
	vehicleColor?: string;

	@IsOptional()
	@Min(0)
	@Field(() => Number, { nullable: true })
	vehiclePrice?: number;

	@IsOptional()
	@Length(1, 100)
	@Field(() => String, { nullable: true })
	vehicleLocation?: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	vehicleStockQuantity?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	vehicleImages?: string[];

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

	@IsOptional()
	@Field(() => VehicleStatus, { nullable: true })
	vehicleStatus?: VehicleStatus;

	soldAt?: Date;

	deletedAt?: Date;
}
