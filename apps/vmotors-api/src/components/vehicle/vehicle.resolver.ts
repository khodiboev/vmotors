import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
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
import { VehicleService } from './vehicle.service';

@Resolver()
export class VehicleResolver {
	constructor(private readonly vehicleService: VehicleService) {}

	@Roles(MemberType.AGENT)
	@UseGuards(AuthGuard, RolesGuard)
	@Mutation(() => Vehicle)
	public async createVehicle(
		@Args('input') input: VehicleInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicle> {
		console.log('Mutation: createVehicle');
		input.memberId = memberId;
		return await this.vehicleService.createVehicle(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Vehicle)
	public async getVehicle(
		@Args('vehicleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicle> {
		console.log('Query: getVehicle');
		const vehicleId = shapeIntoMongoObjectId(input);
		return await this.vehicleService.getVehicle(vehicleId, memberId);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Vehicle)
	public async updateVehicle(
		@Args('input') input: VehicleUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicle> {
		console.log('Mutation: updateVehicle');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.vehicleService.updateVehicle(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Vehicles)
	public async getVehicles(
		@Args('input') input: VehiclesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicles> {
		console.log('Query: getVehicles');
		return await this.vehicleService.getVehicles(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Vehicles)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicles> {
		console.log('Query: getFavorites');
		return await this.vehicleService.getFavorites(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Vehicles)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicles> {
		console.log('Query: getVisited');
		return await this.vehicleService.getVisited(memberId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => Vehicles)
	public async getDealerVehicles(
		@Args('input') input: DealerVehiclesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicles> {
		console.log('Query: getDealerVehicles');
		return await this.vehicleService.getDealerVehicles(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Vehicle)
	public async likeTargetVehicle(
		@Args('vehicleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Vehicle> {
		console.log('Mutation: likeTargetVehicle');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.vehicleService.likeTargetVehicle(memberId, likeRefId);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Vehicles)
	public async getAllVehiclesByAdmin(@Args('input') input: AllVehiclesInquiry): Promise<Vehicles> {
		console.log('Query: getAllVehiclesByAdmin');
		return await this.vehicleService.getAllVehiclesByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Vehicle)
	public async updateVehicleByAdmin(@Args('input') input: VehicleUpdate): Promise<Vehicle> {
		console.log('Mutation: updateVehicleByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.vehicleService.updateVehicleByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Vehicle)
	public async removeVehicleByAdmin(@Args('vehicleId') input: string): Promise<Vehicle> {
		console.log('Mutation: removeVehicleByAdmin');
		const vehicleId = shapeIntoMongoObjectId(input);
		return await this.vehicleService.removeVehicleByAdmin(vehicleId);
	}
}
