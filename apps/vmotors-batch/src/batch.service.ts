import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle } from '../../vmotors-api/src/libs/dto/vehicle/vehicle';
import { Member } from '../../vmotors-api/src/libs/dto/member/member';
import { VehicleStatus } from '../../vmotors-api/src/libs/enums/vehicle.enum';
import { MemberStatus, MemberType } from '../../vmotors-api/src/libs/enums/member.enum';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Vehicle') private readonly vehicleModel: Model<Vehicle>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		await this.vehicleModel
			.updateMany(
				{
					vehicleStatus: VehicleStatus.AVAILABLE,
					deletedAt: { $exists: false },
				},
				{ vehicleRank: 0 },
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopVehicles(): Promise<void> {
		const vehicles: Vehicle[] = await this.vehicleModel
			.find({
				vehicleStatus: VehicleStatus.AVAILABLE,
				vehicleRank: 0,
				deletedAt: { $exists: false },
			})
			.exec();

		const promisedList = vehicles.map(async (ele: Vehicle) => {
			const { _id, vehicleLikes, vehicleViews } = ele;
			const rank = vehicleLikes * 2 + vehicleViews * 1;
			return await this.vehicleModel.findByIdAndUpdate(_id, { vehicleRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchTopAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel
			.find({
				memberType: MemberType.AGENT,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberVehicles, memberLikes, memberArticles, memberViews } = ele;
			const rank = memberVehicles * 5 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
		});
		await Promise.all(promisedList);
	}

	public getHello(): string {
		return 'Hello VMotors Batch server!';
	}
}
