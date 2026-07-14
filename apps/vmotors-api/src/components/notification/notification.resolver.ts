import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { ObjectId } from 'mongoose';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Conversations, Notification, Notifications } from '../../libs/dto/notification/notification';
import {
	ConversationInquiry,
	MessageInput,
	NotificationsInquiry,
} from '../../libs/dto/notification/notification.input';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async sendMessage(
		@Args('input') input: MessageInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: sendMessage');
		input.receiverId = shapeIntoMongoObjectId(input.receiverId);
		if (input.vehicleId) input.vehicleId = shapeIntoMongoObjectId(input.vehicleId);
		return await this.notificationService.sendMessage(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	public async getMyNotifications(
		@Args('input') input: NotificationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		console.log('Query: getMyNotifications');
		return await this.notificationService.getMyNotifications(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Conversations)
	public async getMyConversations(@AuthMember('_id') memberId: ObjectId): Promise<Conversations> {
		console.log('Query: getMyConversations');
		return await this.notificationService.getMyConversations(memberId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	public async getConversation(
		@Args('input') input: ConversationInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		console.log('Query: getConversation');
		input.peerId = shapeIntoMongoObjectId(input.peerId);
		return await this.notificationService.getConversation(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Int)
	public async readConversation(
		@Args('peerId') peerId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<number> {
		console.log('Mutation: readConversation');
		return await this.notificationService.readConversation(memberId, shapeIntoMongoObjectId(peerId));
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async readNotification(
		@Args('notificationId') notificationId: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		console.log('Mutation: readNotification');
		return await this.notificationService.readNotification(memberId, shapeIntoMongoObjectId(notificationId));
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Int)
	public async readAllNotifications(@AuthMember('_id') memberId: ObjectId): Promise<number> {
		console.log('Mutation: readAllNotifications');
		return await this.notificationService.readAllNotifications(memberId);
	}
}
