import { Configuration } from '../../../configuration';

export interface SummaryEmoji {
  readonly code: string;
  readonly emoji: string;
  readonly description: string;
}

interface CustomeEmoji {
  [key: string]: Partial<SummaryEmoji>;
}

/**
 * @see https://github.com/carloscuesta/gitmoji/blob/master/packages/gitmojis/src/gitmojis.json
 */
const summaryEmojis = require('gitmojis').gitmojis as SummaryEmoji[];

export function getSummaryEmojis(config: Configuration): SummaryEmoji[] {
  const summeryCustomEmoji = config.summaryCustomEmoji as CustomeEmoji;

  const keyRoleModel = ['code', 'emoji', 'description'];
  const defaultCode = summaryEmojis.map((v) => v.code);

  const addSummaryEmoji = Object.values(summeryCustomEmoji)
    .filter((v) => !defaultCode.includes(v.code as string))
    .filter((v) => config.isRequiredType<SummaryEmoji>(keyRoleModel, v))
    .map((v) => v as SummaryEmoji);

  return summaryEmojis
    .map((e): SummaryEmoji => {
      return { ...e, ...summeryCustomEmoji[e.code] };
    })
    .concat(addSummaryEmoji);
}
