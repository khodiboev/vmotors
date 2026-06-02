import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import moment from 'moment';
import { Model, ObjectId } from 'mongoose';
import { LikeService } from '../like/like.service';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { VehicleInput } from '../../libs/dto/vehicle/vehicle.input';
import { VehicleUpdate } from '../../libs/dto/vehicle/vehicle.update';
import { Vehicle } from '../../libs/dto/vehicle/vehicle';
import { Vehicles } from '../../libs/dto/vehicle/vehicles';
import {
	AllVehiclesInquiry,
	DealerVehiclesInquiry,
	OrdinaryInquiry,
	VehiclesInquiry,
} from '../../libs/dto/vehicle/vehicle.inquiry';
import { Direction, Message } from '../../libs/enums/common.enum';
import { LikeGroup } from '../../libs/enums/like.enum';
import { VehicleStatus } from '../../libs/enums/vehicle.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { StatisticModifier, T } from '../../libs/types/common';

@Injectable()
export class VehicleService {
	constructor(
		@InjectModel('Vehicle') private readonly vehicleModel: Model<Vehicle>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async createVehicle(input: VehicleInput): Promise<Vehicle> {
		try {
			const result = await this.vehicleModel.create(input);

			await this.memberService.memberStatsEditor({
				_id: input.memberId,
				targetKey: 'memberVehicles',
				modifier: 1,
			});

			return result;
		} catch (err) {
			console.log('Error creating vehicle, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getVehicle(vehicleId: ObjectId, memberId: ObjectId): Promise<Vehicle> {
		const search: T = {
			_id: vehicleId,
			vehicleStatus: VehicleStatus.AVAILABLE,
			deletedAt: { $exists: false },
		};

		const targetVehicle: Vehicle = (await this.vehicleModel.findOne(search).lean().exec()) as Vehicle;
		if (!targetVehicle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId, viewRefId: vehicleId, viewGroup: ViewGroup.VEHICLE };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.vehicleStatsEditor({ _id: vehicleId, targetKey: 'vehicleViews', modifier: 1 });
				targetVehicle.vehicleViews++;
			}

			const likeInput: LikeInput = {
				memberId,
				likeRefId: vehicleId,
				likeGroup: LikeGroup.VEHICLE,
			};
			targetVehicle.meLiked = (await this.likeService.checkLikeExistence(likeInput)) as any;
		}

		targetVehicle.memberData = await this.memberService.getMember(memberId, targetVehicle.memberId);
		return targetVehicle;
	}

	public async vehicleStatsEditor(input: StatisticModifier): Promise<Vehicle> {
		const { _id, targetKey, modifier } = input;
		return (await this.vehicleModel
			.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec()) as Vehicle;
	}

	public async updateVehicle(memberId: ObjectId, input: VehicleUpdate): Promise<Vehicle> {
		this.applyStatusDates(input);

		const search: T = {
			_id: input._id,
			memberId,
			deletedAt: { $exists: false },
		};

		const result = await this.vehicleModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getVehicles(memberId: ObjectId, input: VehiclesInquiry): Promise<Vehicles> {
		const match: T = {
			vehicleStatus: VehicleStatus.AVAILABLE,
			deletedAt: { $exists: false },
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);

		const result = await this.vehicleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	private shapeMatchQuery(match: T, input: VehiclesInquiry): void {
		const {
			memberId,
			brandList,
			modelList,
			fuelList,
			transmissionList,
			locationList,
			periodsRange,
			pricesRange,
			yearsRange,
			text,
		} = input.search;

		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (brandList && brandList.length) match.vehicleBrand = { $in: brandList };
		if (modelList && modelList.length) match.vehicleModel = { $in: modelList };
		if (fuelList && fuelList.length) match.vehicleFuel = { $in: fuelList };
		if (transmissionList && transmissionList.length) match.vehicleTransmission = { $in: transmissionList };
		if (locationList && locationList.length) match.vehicleLocation = { $in: locationList };

		if (pricesRange) match.vehiclePrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (yearsRange) match.vehicleYear = { $gte: yearsRange.start, $lte: yearsRange.end };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (text) {
			const regex = new RegExp(text, 'i');
			match.$or = [
				{ vehicleBrand: regex },
				{ vehicleModel: regex },
				{ vehicleTrim: regex },
				{ vehicleColor: regex },
				{ vehicleLocation: regex },
				{ vehicleDesc: regex },
			];
		}
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Vehicles> {
		return await this.likeService.getFavoriteVehicles(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Vehicles> {
		return await this.viewService.getVisitedVehicles(memberId, input);
	}

	public async getDealerVehicles(memberId: ObjectId, input: DealerVehiclesInquiry): Promise<Vehicles> {
		const { vehicleStatus } = input.search;
		const match: T = {
			memberId,
			deletedAt: { $exists: false },
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (vehicleStatus) match.vehicleStatus = vehicleStatus;

		const result = await this.vehicleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetVehicle(memberId: ObjectId, likeRefId: ObjectId): Promise<Vehicle> {
		const target = await this.vehicleModel
			.findOne({ _id: likeRefId, vehicleStatus: VehicleStatus.AVAILABLE, deletedAt: { $exists: false } })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			likeGroup: LikeGroup.VEHICLE,
			likeRefId,
			memberId,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.vehicleStatsEditor({ _id: likeRefId, targetKey: 'vehicleLikes', modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}

	public async getAllVehiclesByAdmin(input: AllVehiclesInquiry): Promise<Vehicles> {
		const { vehicleStatus, vehicleBrandList, vehicleLocationList } = input.search;
		const match: T = { deletedAt: { $exists: false } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (vehicleStatus) match.vehicleStatus = vehicleStatus;
		if (vehicleBrandList && vehicleBrandList.length) match.vehicleBrand = { $in: vehicleBrandList };
		if (vehicleLocationList && vehicleLocationList.length) match.vehicleLocation = { $in: vehicleLocationList };

		const result = await this.vehicleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateVehicleByAdmin(input: VehicleUpdate): Promise<Vehicle> {
		this.applyStatusDates(input);

		const search: T = {
			_id: input._id,
			deletedAt: { $exists: false },
		};

		const result = await this.vehicleModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async removeVehicleByAdmin(vehicleId: ObjectId): Promise<Vehicle> {
		const result = await this.vehicleModel
			.findOneAndUpdate({ _id: vehicleId, deletedAt: { $exists: false } }, { deletedAt: moment().toDate() }, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		await this.memberService.memberStatsEditor({
			_id: result.memberId,
			targetKey: 'memberVehicles',
			modifier: -1,
		});

		return result;
	}

	private applyStatusDates(input: VehicleUpdate): void {
		if (input.vehicleStatus === VehicleStatus.SOLD && !input.soldAt) {
			input.soldAt = moment().toDate();
		}
	}
}
