export const BOARD_ARTICLE_TITLE_MIN_LENGTH = 5;
export const BOARD_ARTICLE_TITLE_MAX_LENGTH = 100;
export const BOARD_ARTICLE_CONTENT_MIN_LENGTH = 1;
export const BOARD_ARTICLE_CONTENT_MAX_LENGTH = 1000;

export const getBoardArticlePlainText = (value = ''): string =>
	value
		.replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/[`*_>#~|-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

export const getBoardArticlePlainTextLength = (value = ''): number => getBoardArticlePlainText(value).length;
