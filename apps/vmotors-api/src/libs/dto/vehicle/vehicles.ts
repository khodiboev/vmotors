import { Field, ObjectType } from '@nestjs/graphql';
import { TotalCounter } from '../member/member';
import { Vehicle } from './vehicle';

@ObjectType()
export class Vehicles {
	@Field(() => [Vehicle])
	list!: Vehicle[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter?: TotalCounter[];
}
