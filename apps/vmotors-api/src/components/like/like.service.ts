import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { Model, ObjectId } from 'mongoose';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/vehicle/vehicle.inquiry';
import { Vehicles } from '../../libs/dto/vehicle/vehicles';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavoriteVehicle } from '../../libs/config';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId, likeGroup: input.likeGroup };
		const exist = await this.likeModel.findOne(search).exec();

		let modifier: number;
		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);
				modifier = 1;
			} catch (err) {
				console.log('ERROR, Service.model:', err);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}

		console.log('Like toggled, modifier:', modifier);
		return modifier;
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId, likeGroup } = input;
		const result = await this.likeModel.findOne({ memberId, likeRefId, likeGroup }).exec();

		return result ? [{ memberId, likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteVehicles(memberId: ObjectId, inquery: OrdinaryInquiry): Promise<Vehicles> {
		const { page, limit } = inquery;
		const match: T = { memberId, likeGroup: LikeGroup.VEHICLE };

		const data: T = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'vehicles',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteVehicle',
					},
				},
				{ $unwind: '$favoriteVehicle' },
				{ $match: { 'favoriteVehicle.deletedAt': { $exists: false } } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavoriteVehicle,
							{ $unwind: '$favoriteVehicle.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Vehicles = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteVehicle);
		return result;
	}
}
