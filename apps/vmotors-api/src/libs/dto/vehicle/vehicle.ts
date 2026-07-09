import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { VehicleBrand, VehicleFuel, VehicleStatus, VehicleTransmission } from '../../enums/vehicle.enum';
import { Member } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Vehicle {
	@Field(() => String)
	_id!: ObjectId;

	@Field(() => VehicleBrand)
	vehicleBrand!: VehicleBrand;

	@Field(() => String)
	vehicleModel!: string;

	@Field(() => String)
	vehicleTrim!: string;

	@Field(() => Int)
	vehicleYear!: number;

	@Field(() => VehicleFuel)
	vehicleFuel!: VehicleFuel;

	@Field(() => VehicleTransmission)
	vehicleTransmission!: VehicleTransmission;

	@Field(() => String)
	vehicleColor!: string;

	@Field(() => Number)
	vehiclePrice!: number;

	@Field(() => String)
	vehicleLocation!: string;

	@Field(() => Int)
	vehicleStockQuantity!: number;

	@Field(() => [String])
	vehicleImages!: string[];

	@Field(() => String, { nullable: true })
	vehicleDesc?: string;

	@Field(() => String, { nullable: true })
	vehicleBodyType?: string;

	@Field(() => Int, { nullable: true })
	vehicleMileage?: number;

	@Field(() => VehicleStatus)
	vehicleStatus!: VehicleStatus;

	@Field(() => Int)
	vehicleViews!: number;

	@Field(() => Int)
	vehicleLikes!: number;

	@Field(() => Int)
	vehicleComments!: number;

	@Field(() => Int)
	vehicleRank!: number;

	@Field(() => String)
	memberId!: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	/** from aggregation */
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}
