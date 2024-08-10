import { Configuration } from '../../../configuration';

export interface SummaryType {
  readonly type: string;
  readonly title: string;
  readonly description: string;
  readonly emojis: string[];
  readonly sort: number;
}

interface CustomeType {
  [key: string]: Partial<SummaryType>;
}

/**
 * @see https://github.com/commitizen/conventional-commit-types/blob/master/index.json
 */
const summaryTypes: SummaryType[] = (function () {
  const summaryTypes: SummaryType[] = [
    {
      type: 'feat',
      title: '',
      description: '',
      emojis: ['✨'],
      sort: 1
    },
    {
      type: 'fix',
      title: '',
      description: '',
      emojis: ['🐛', '🩹', '🚑️'],
      sort: 2
    },
    {
      type: 'docs',
      title: '',
      description: '',
      emojis: ['📝', '✏️'],
      sort: 3
    },
    {
      type: 'style',
      title: '',
      description: '',
      emojis: ['🎨', '💄'],
      sort: 4
    },
    {
      type: 'refactor',
      title: '',
      description: '',
      emojis: ['♻️'],
      sort: 5
    },
    {
      type: 'perf',
      title: '',
      description: '',
      emojis: ['⚡️'],
      sort: 6
    },
    {
      type: 'test',
      title: '',
      description: '',
      emojis: ['✅', '🧪'],
      sort: 7
    },
    {
      type: 'build',
      title: '',
      description: '',
      emojis: ['📦️'],
      sort: 8
    },
    {
      type: 'ci',
      title: '',
      description: '',
      emojis: ['👷', '💚'],
      sort: 9
    },
    {
      type: 'chore',
      title: '',
      description: '',
      emojis: ['🔧', '🔨', '🍱'],
      sort: 10
    },
    {
      type: 'revert',
      title: '',
      description: '',
      emojis: ['⏪️', '🗑️'],
      sort: 11
    },
    {
      type: 'wip',
      title: 'Work In Progress',
      description: 'A commit that will be squashed later',
      emojis: ['🚧'],
      sort: 98
    },
    {
      type: 'initial',
      title: 'Initial',
      description: 'Initial commit',
      emojis: ['🎉'],
      sort: 99
    }
  ];

  const commitizenTypes = require('conventional-commit-types').types as CustomeType;

  return summaryTypes.map((e): SummaryType => {
    return { ...e, ...commitizenTypes[e.type] };
  });
})();

export function getSummaryTypes(config: Configuration): SummaryType[] {
  const summaryCustomType = config.summaryCustomType as CustomeType;

  const keyRoleModel = ['type', 'title', 'description', 'emojis', 'sort'];
  const defaultType = summaryTypes.map((v) => v.type);
  const addSummaryType = Object.values(summaryCustomType)
    .filter((v) => !defaultType.includes(v.type as string))
    .filter((v) => config.isRequiredType<SummaryType>(keyRoleModel, v))
    .map((v) => v as SummaryType);

  const mergeSummaryTypes = summaryTypes
    .map((e): SummaryType => {
      return { ...e, ...summaryCustomType[e.type] };
    })
    .concat(addSummaryType);

  const removeType = config.removeType as string[];
  const fixedSummaryTypes = mergeSummaryTypes.filter((v) => !removeType.includes(v.type));

  return fixedSummaryTypes;
}
