import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { ObjectId } from 'mongoose';
import { GraphQLUpload } from 'graphql-upload';
import type { FileUpload } from 'graphql-upload';
import { createWriteStream, unlink } from 'fs';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Conversations, Notification, Notifications } from '../../libs/dto/notification/notification';
import {
	ConversationInquiry,
	MessageInput,
	NotificationsInquiry,
	NotificationUpdate,
} from '../../libs/dto/notification/notification.input';
import { getSerialForImage, shapeIntoMongoObjectId } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	// Chat attachments accept any file type (unlike MemberResolver.imageUploader) — a private
	// 1:1 message can carry a PDF, a doc, a zip, etc. Size is already capped globally at 15MB
	// by graphqlUploadExpress in main.ts, so no extra size check is needed here.
	@UseGuards(AuthGuard)
	@Mutation(() => String)
	public async fileUploader(
		@Args({ name: 'file', type: () => GraphQLUpload })
		{ createReadStream, filename }: FileUpload,
	): Promise<string> {
		if (!filename) throw new Error(Message.UPLOAD_FAILED);

		const fileName = getSerialForImage(filename);
		const url = `uploads/message/${fileName}`;
		const stream = createReadStream();

		const result = await new Promise((resolve) => {
			// The source stream (not just the destination) can emit 'error' — e.g. graphql-upload
			// aborting a read past maxFileSize. An unhandled 'error' event crashes the whole
			// process, so both ends need a listener here, not just the write side.
			stream.on('error', () => {
				unlink(url, () => {});
				resolve(false);
			});
			stream
				.pipe(createWriteStream(url))
				.on('finish', () => resolve(true))
				.on('error', () => {
					unlink(url, () => {});
					resolve(false);
				});
		});
		if (!result) throw new Error(Message.UPLOAD_FAILED);

		return url;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async sendMessage(
		@Args('input') input: MessageInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		input.receiverId = shapeIntoMongoObjectId(input.receiverId);
		if (input.vehicleId) input.vehicleId = shapeIntoMongoObjectId(input.vehicleId);
		return await this.notificationService.sendMessage(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async updateMessage(
		@Args('input') input: NotificationUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.notificationService.updateMessage(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	public async getMyNotifications(
		@Args('input') input: NotificationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		return await this.notificationService.getMyNotifications(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Conversations)
	public async getMyConversations(@AuthMember('_id') memberId: ObjectId): Promise<Conversations> {
		return await this.notificationService.getMyConversations(memberId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	public async getConversation(
		@Args('input') input: ConversationInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		input.peerId = shapeIntoMongoObjectId(input.peerId);
		return await this.notificationService.getConversation(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Int)
	public async readConversation(
		@Args('peerId') peerId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<number> {
		return await this.notificationService.readConversation(memberId, shapeIntoMongoObjectId(peerId));
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async readNotification(
		@Args('notificationId') notificationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		return await this.notificationService.readNotification(memberId, shapeIntoMongoObjectId(notificationId));
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Int)
	public async readAllNotifications(@AuthMember('_id') memberId: ObjectId): Promise<number> {
		return await this.notificationService.readAllNotifications(memberId);
	}
}
