declare module 'bcryptjs' {
	export function genSalt(rounds?: number): Promise<string>;
	export function hash(password: string, salt: string | number): Promise<string>;
	export function compare(password: string, hash: string): Promise<boolean>;
}

declare module 'graphql-upload' {
	import type { RequestHandler } from 'express';
	import type { ReadStream } from 'fs';
	import type { GraphQLScalarType } from 'graphql';

	export const GraphQLUpload: GraphQLScalarType;
	export function graphqlUploadExpress(options?: { maxFileSize?: number; maxFiles?: number }): RequestHandler;

	export interface FileUpload {
		filename: string;
		mimetype: string;
		encoding: string;
		createReadStream(): ReadStream;
	}
}
