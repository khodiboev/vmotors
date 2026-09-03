import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Conversations, Notification, Notifications } from '../../libs/dto/notification/notification';
import {
	ConversationInquiry,
	MessageInput,
	NotificationCreate,
	NotificationsInquiry,
	NotificationUpdate,
} from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../libs/enums/notification.enum';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { SocketGateway } from '../../socket/socket.gateway';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
		private readonly socketGateway: SocketGateway,
	) {}

	public async createNotification(input: NotificationCreate): Promise<Notification | null> {
		// Members never get notified about their own actions
		if (String(input.authorId) === String(input.receiverId)) return null;

		try {
			const result = await this.notificationModel.create(input);
			await this.pushToReceiver(result._id, input.receiverId);
			return result;
		} catch (err) {
			// A failed notification must never break the action that triggered it
			console.log('Error, NotificationService.createNotification:', err);
			return null;
		}
	}

	public async sendMessage(authorId: ObjectId, input: MessageInput): Promise<Notification> {
		if (!input.notificationDesc?.trim() && !input.attachmentUrl) {
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}

		const notification = await this.createNotification({
			notificationType: NotificationType.MESSAGE,
			notificationGroup: input.vehicleId ? NotificationGroup.VEHICLE : NotificationGroup.MEMBER,
			notificationTitle: 'sent you a message',
			notificationDesc: input.notificationDesc,
			authorId,
			receiverId: input.receiverId,
			vehicleId: input.vehicleId,
			attachmentUrl: input.attachmentUrl,
			attachmentName: input.attachmentName,
			attachmentSize: input.attachmentSize,
		});
		if (!notification) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return notification;
	}

	public async updateMessage(memberId: ObjectId, input: NotificationUpdate): Promise<Notification> {
		const { _id } = input;
		const result = await this.notificationModel
			.findOneAndUpdate(
				{
					_id,
					authorId: memberId,
					notificationType: NotificationType.MESSAGE,
					notificationStatus: { $ne: NotificationStatus.DELETE },
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getMyNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		const { page, limit, notificationStatus } = input;
		const match: T = { receiverId: memberId };
		if (notificationStatus) match.notificationStatus = notificationStatus;

		const data = await this.notificationModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							{
								$lookup: {
									from: 'members',
									localField: 'authorId',
									foreignField: '_id',
									as: 'authorData',
								},
							},
							{ $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		return { list: data[0].list, metaCounter: data[0].metaCounter };
	}

	public async readNotification(memberId: ObjectId, notificationId: ObjectId): Promise<Notification> {
		const result = await this.notificationModel
			.findOneAndUpdate(
				{ _id: notificationId, receiverId: memberId },
				{ notificationStatus: NotificationStatus.READ },
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result;
	}

	public async readAllNotifications(memberId: ObjectId): Promise<number> {
		const result = await this.notificationModel
			.updateMany(
				{ receiverId: memberId, notificationStatus: NotificationStatus.WAIT },
				{ notificationStatus: NotificationStatus.READ },
			)
			.exec();
		return result.modifiedCount;
	}

	public async getMyConversations(memberId: ObjectId): Promise<Conversations> {
		const data = await this.notificationModel
			.aggregate([
				{
					$match: {
						notificationType: NotificationType.MESSAGE,
						notificationStatus: { $ne: NotificationStatus.DELETE },
						$or: [{ authorId: memberId }, { receiverId: memberId }],
					},
				},
				{
					$addFields: {
						peerId: { $cond: [{ $eq: ['$authorId', memberId] }, '$receiverId', '$authorId'] },
					},
				},
				{ $sort: { createdAt: -1 } },
				{
					$group: {
						_id: '$peerId',
						lastMessage: { $first: '$$ROOT' },
						unreadCount: {
							$sum: {
								$cond: [
									{
										$and: [
											{ $eq: ['$receiverId', memberId] },
											{ $eq: ['$notificationStatus', NotificationStatus.WAIT] },
										],
									},
									1,
									0,
								],
							},
						},
					},
				},
				{ $sort: { 'lastMessage.createdAt': -1 } },
				{
					$lookup: {
						from: 'members',
						localField: '_id',
						foreignField: '_id',
						as: 'peerData',
					},
				},
				{ $unwind: { path: '$peerData', preserveNullAndEmptyArrays: true } },
				{ $project: { peerId: '$_id', peerData: 1, lastMessage: 1, unreadCount: 1, _id: 0 } },
			])
			.exec();

		return { list: data };
	}

	public async getConversation(memberId: ObjectId, input: ConversationInquiry): Promise<Notifications> {
		const { peerId, page, limit } = input;
		const match: T = {
			notificationType: NotificationType.MESSAGE,
			notificationStatus: { $ne: NotificationStatus.DELETE },
			$or: [
				{ authorId: memberId, receiverId: peerId },
				{ authorId: peerId, receiverId: memberId },
			],
		};

		const data = await this.notificationModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						// newest page first, then restored to chronological order for rendering
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }, { $sort: { createdAt: 1 } }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		return { list: data[0].list, metaCounter: data[0].metaCounter };
	}

	public async readConversation(memberId: ObjectId, peerId: ObjectId): Promise<number> {
		const result = await this.notificationModel
			.updateMany(
				{
					notificationType: NotificationType.MESSAGE,
					authorId: peerId,
					receiverId: memberId,
					notificationStatus: NotificationStatus.WAIT,
				},
				{ notificationStatus: NotificationStatus.READ },
			)
			.exec();
		return result.modifiedCount;
	}

	private async pushToReceiver(notificationId: ObjectId, receiverId: ObjectId): Promise<void> {
		const data = await this.notificationModel
			.aggregate([
				{ $match: { _id: notificationId } },
				{
					$lookup: {
						from: 'members',
						localField: 'authorId',
						foreignField: '_id',
						as: 'authorData',
					},
				},
				{ $unwind: { path: '$authorData', preserveNullAndEmptyArrays: true } },
			])
			.exec();

		if (data[0]) this.socketGateway.sendNotification(String(receiverId), data[0]);
	}
}
