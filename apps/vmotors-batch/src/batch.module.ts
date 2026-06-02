import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { BatchService } from './batch.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import VehicleSchema from 'apps/vmotors-api/src/schemas/Vehicle.model';
import MemberSchema from 'apps/vmotors-api/src/schemas/Member.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		ScheduleModule.forRoot(),
		MongooseModule.forFeature([{ name: 'Vehicle', schema: VehicleSchema }]),
		MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }]),
	],
	controllers: [BatchController],
	providers: [BatchService],
})
export class BatchModule {}
