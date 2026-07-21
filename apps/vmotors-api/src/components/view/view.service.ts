import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { OrdinaryInquiry } from '../../libs/dto/vehicle/vehicle.inquiry';
import { Vehicles } from '../../libs/dto/vehicle/vehicles';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupVisitedVehicle } from '../../libs/config';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const view = await this.checkViewExistence(input);
		if (!view) {
			return await this.viewModel.create(input);
		} else return null;
	}

	private async checkViewExistence(input: ViewInput): Promise<View | null> {
		const { memberId, viewRefId } = input;
		const search: T = {
			memberId: memberId,
			viewRefId: viewRefId,
			viewGroup: input.viewGroup,
		};
		return await this.viewModel.findOne(search).exec();
	}

	public async getVisitedVehicles(memberId: ObjectId, inquery: OrdinaryInquiry): Promise<Vehicles> {
		const { page, limit } = inquery;
		const match: T = { memberId, viewGroup: ViewGroup.VEHICLE };

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'vehicles',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedVehicle',
					},
				},
				{ $unwind: '$visitedVehicle' },
				{ $match: { 'visitedVehicle.deletedAt': { $exists: false } } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisitedVehicle,
							{ $unwind: '$visitedVehicle.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Vehicles = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedVehicle);
		return result;
	}
}
