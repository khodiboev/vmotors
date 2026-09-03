import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Member } from '../../libs/dto/member/member';

export type AuthenticatedMember = Member & {
	authorization?: string | string[];
};

interface AuthenticatedRequestBody {
	authMember?: AuthenticatedMember | null;
}

export type AuthenticatedRequest = Request<Record<string, string>, unknown, AuthenticatedRequestBody>;

interface GraphQLRequestContext {
	req: AuthenticatedRequest;
}

interface ContextWithType {
	contextType?: string;
}

export const isGraphQLContext = (context: ExecutionContext): boolean => {
	const typedContext = context as ExecutionContext & ContextWithType;
	return typedContext.contextType === 'graphql' || context.getType<string>() === 'graphql';
};

export const getGraphQLRequest = (context: ExecutionContext): AuthenticatedRequest => {
	return context.getArgByIndex<GraphQLRequestContext>(2).req;
};

export const getBearerToken = (authorization: string | string[] | undefined): string | null => {
	if (typeof authorization !== 'string') return null;
	const [, token] = authorization.split(' ');
	return token ?? null;
};
