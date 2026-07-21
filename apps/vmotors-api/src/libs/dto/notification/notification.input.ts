import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import type { ObjectId } from 'mongoose';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';

@InputType()
export class MessageInput {
	@IsNotEmpty()
	@Field(() => String)
	receiverId!: ObjectId;

	@IsNotEmpty()
	@Length(1, 500)
	@Field(() => String)
	notificationDesc!: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	vehicleId?: ObjectId;

	authorId?: ObjectId;
}

@InputType()
export class NotificationsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;

	@IsOptional()
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;
}

@InputType()
export class NotificationUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

	@IsOptional()
	@Length(1, 500)
	@Field(() => String, { nullable: true })
	notificationDesc?: string;

	@IsOptional()
	@Field(() => NotificationStatus, { nullable: true })
	notificationStatus?: NotificationStatus;
}

@InputType()
export class ConversationInquiry {
	@IsNotEmpty()
	@Field(() => String)
	peerId!: ObjectId;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page!: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit!: number;
}

export interface NotificationCreate {
	notificationType: NotificationType;
	notificationGroup: NotificationGroup;
	notificationTitle: string;
	notificationDesc?: string;
	authorId: ObjectId;
	receiverId: ObjectId;
	vehicleId?: ObjectId;
	articleId?: ObjectId;
}
