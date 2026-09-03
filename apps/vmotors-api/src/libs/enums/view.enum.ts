import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	VEHICLE = 'VEHICLE',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
