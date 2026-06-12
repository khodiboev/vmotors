import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import {
	BOARD_ARTICLE_CONTENT_MAX_LENGTH,
	BOARD_ARTICLE_CONTENT_MIN_LENGTH,
	getBoardArticlePlainTextLength,
} from '../helpers/board-article.helper';

export const IsValidBoardArticleContent = (validationOptions?: ValidationOptions) => {
	return (object: object, propertyName: string) => {
		registerDecorator({
			name: 'isValidBoardArticleContent',
			target: object.constructor,
			propertyName,
			options: validationOptions,
			validator: {
				validate(value: unknown) {
					if (typeof value !== 'string') return false;
					const length = getBoardArticlePlainTextLength(value);
					return (
						length >= BOARD_ARTICLE_CONTENT_MIN_LENGTH &&
						length <= BOARD_ARTICLE_CONTENT_MAX_LENGTH
					);
				},
				defaultMessage(args?: ValidationArguments) {
					return `${args?.property ?? 'articleContent'} must contain between ${BOARD_ARTICLE_CONTENT_MIN_LENGTH} and ${BOARD_ARTICLE_CONTENT_MAX_LENGTH} meaningful characters.`;
				},
			},
		});
	};
};
