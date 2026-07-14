import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticesInquiry } from '../../libs/dto/notice/notice.input';
import { NoticeUpdate } from '../../libs/dto/notice/notice.update';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';

@Injectable()
export class NoticeService {
	constructor(@InjectModel('Notice') private readonly noticeModel: Model<Notice>) {}

	public async createNoticeByAdmin(memberId: ObjectId, input: NoticeInput): Promise<Notice> {
		input.memberId = memberId;
		try {
			return await this.noticeModel.create(input);
		} catch (err) {
			console.log('Error, NoticeService.createNoticeByAdmin:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async updateNoticeByAdmin(input: NoticeUpdate): Promise<Notice> {
		const result = await this.noticeModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async removeNoticeByAdmin(noticeId: ObjectId): Promise<Notice> {
		const result = await this.noticeModel.findOneAndDelete({ _id: noticeId }).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	public async getAllNoticesByAdmin(input: NoticesInquiry): Promise<Notices> {
		return await this.listNotices(input, {});
	}

	// Public: visitors only ever see ACTIVE entries
	public async getNotices(input: NoticesInquiry): Promise<Notices> {
		return await this.listNotices(input, { noticeStatus: NoticeStatus.ACTIVE });
	}

	private async listNotices(input: NoticesInquiry, baseMatch: T): Promise<Notices> {
		const { noticeCategory, noticeSubCategory, noticeStatus, text } = input.search;
		const match: T = { ...baseMatch };
		if (noticeCategory) match.noticeCategory = noticeCategory;
		if (noticeSubCategory) match.noticeSubCategory = noticeSubCategory;
		if (noticeStatus && !baseMatch.noticeStatus) match.noticeStatus = noticeStatus;
		if (text) {
			const regex = { $regex: new RegExp(text, 'i') };
			match.$or = [{ noticeTitle: regex }, { noticeContent: regex }];
		}

		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const data = await this.noticeModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		return { list: data[0].list, metaCounter: data[0].metaCounter };
	}
}
