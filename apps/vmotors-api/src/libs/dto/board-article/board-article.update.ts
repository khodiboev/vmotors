import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import type { ObjectId } from 'mongoose';
import {
	BOARD_ARTICLE_TITLE_MAX_LENGTH,
	BOARD_ARTICLE_TITLE_MIN_LENGTH,
} from '../../helpers/board-article.helper';
import { IsValidBoardArticleContent } from '../../validators/board-article-content.validator';

@InputType()
export class BoardArticleUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id!: ObjectId;

	@IsOptional()
	@Field(() => BoardArticleStatus, { nullable: true })
	articleStatus?: BoardArticleStatus;

	@IsOptional()
	@Field(() => BoardArticleCategory, { nullable: true })
	articleCategory?: BoardArticleCategory;

	@IsOptional()
	@Length(BOARD_ARTICLE_TITLE_MIN_LENGTH, BOARD_ARTICLE_TITLE_MAX_LENGTH)
	@Field(() => String, { nullable: true })
	articleTitle?: string;

	@IsOptional()
	@IsValidBoardArticleContent()
	@Field(() => String, { nullable: true })
	articleContent?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	articleImage?: string;
}
