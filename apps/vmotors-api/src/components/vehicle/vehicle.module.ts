import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { LikeModule } from '../like/like.module';
import { MemberModule } from '../member/member.module';
import { ViewModule } from '../view/view.module';
import { NotificationModule } from '../notification/notification.module';
import VehicleSchema from '../../schemas/Vehicle.model';
import { VehicleResolver } from './vehicle.resolver';
import { VehicleService } from './vehicle.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Vehicle',
				schema: VehicleSchema,
			},
		]),
		AuthModule,
		ViewModule,
		MemberModule,
		LikeModule,
		NotificationModule,
	],
	providers: [VehicleResolver, VehicleService],
	exports: [VehicleService],
})
export class VehicleModule {}
