import { registerEnumType } from '@nestjs/graphql';

export enum LikeGroup {
	MEMBER = 'MEMBER',
	VEHICLE = 'VEHICLE',
	ARTICLE = 'ARTICLE',
}
registerEnumType(LikeGroup, {
	name: 'LikeGroup',
});
