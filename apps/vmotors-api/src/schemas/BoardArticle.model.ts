import { Schema } from 'mongoose';
import { BoardArticleCategory, BoardArticleStatus } from '../libs/enums/board-article.enum';
import {
	BOARD_ARTICLE_CONTENT_MAX_LENGTH,
	BOARD_ARTICLE_CONTENT_MIN_LENGTH,
	BOARD_ARTICLE_TITLE_MAX_LENGTH,
	BOARD_ARTICLE_TITLE_MIN_LENGTH,
	getBoardArticlePlainTextLength,
} from '../libs/helpers/board-article.helper';

const BoardArticleSchema = new Schema(
	{
		articleCategory: {
			type: String,
			enum: BoardArticleCategory,
			required: true,
		},

		articleStatus: {
			type: String,
			enum: BoardArticleStatus,
			default: BoardArticleStatus.ACTIVE,
		},

		articleTitle: {
			type: String,
			required: true,
			minlength: BOARD_ARTICLE_TITLE_MIN_LENGTH,
			maxlength: BOARD_ARTICLE_TITLE_MAX_LENGTH,
		},

		articleContent: {
			type: String,
			required: true,
			validate: {
				validator: (value: string) => {
					const length = getBoardArticlePlainTextLength(value);
					return (
						length >= BOARD_ARTICLE_CONTENT_MIN_LENGTH &&
						length <= BOARD_ARTICLE_CONTENT_MAX_LENGTH
					);
				},
				message: `articleContent must contain between ${BOARD_ARTICLE_CONTENT_MIN_LENGTH} and ${BOARD_ARTICLE_CONTENT_MAX_LENGTH} meaningful characters.`,
			},
		},

		articleImage: {
			type: String,
		},

		articleLikes: {
			type: Number,
			default: 0,
		},

		articleViews: {
			type: Number,
			default: 0,
		},

		articleComments: {
			type: Number,
			default: 0,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'boardArticles' },
);

export default BoardArticleSchema;
