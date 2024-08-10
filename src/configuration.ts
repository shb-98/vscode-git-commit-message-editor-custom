import * as vscode from 'vscode';

import * as vsceUtil from '@phoihos/vsce-util';

export interface SummaryScope {
  readonly scope: string;
  readonly description?: string;
}

interface SummaryTypeCustom {
  readonly type: string;
  readonly title?: string;
  readonly description?: string;
  readonly emojis?: string[];
  readonly sort?: number;
}

interface SummaryEmojiCustom {
  readonly code: string;
  readonly emoji?: string;
  readonly description?: string;
}

export interface CustomSummary<T extends object> {
  [key: string]: T;
}

export interface Configuration extends vsceUtil.DisposableLike {
  readonly keepAfterSave: boolean;
  readonly recentCommitsEnabled: boolean;
  readonly recentCommitsMaxItems: number;
  readonly completionEnabled: boolean;
  readonly userScopes: SummaryScope[];
  readonly logScopesEnabled: boolean;
  readonly logScopesMaxCommits: number;
  readonly issuesPageSize: number;
  readonly commitsPageSize: number;
  readonly hoverEnabled: boolean;
  readonly removeType: string[];
  readonly summaryCustomType: CustomSummary<SummaryTypeCustom>;
  readonly summaryCustomEmoji: CustomSummary<SummaryEmojiCustom>;

  isRequiredType<T extends object>(keys: string[], redefine: Partial<T>): boolean;
  updateUserScopes(userScopes: SummaryScope[]): Thenable<void>;
}

class ConfigurationImpl extends vsceUtil.Disposable implements Configuration {
  private readonly _sectionPrefix = 'gitCommitMessageEditorCustom.';

  private readonly _cache = new Map<string, any>();

  constructor() {
    super();

    const subscriptions: vscode.Disposable[] = [];
    subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(this._onDidChangeConfiguration, this)
    );
    this.register(subscriptions);
  }

  get keepAfterSave(): boolean {
    return this._getConfigValue<boolean>('editor.keepAfterSave', false);
  }

  get recentCommitsEnabled(): boolean {
    return this._getConfigValue<boolean>('codeLens.recentCommits.enabled', true);
  }

  get recentCommitsMaxItems(): number {
    return this._getConfigValue<number>('codeLens.recentCommits.maxItems', 16);
  }

  get completionEnabled(): boolean {
    return this._getConfigValue<boolean>('intelliSense.completion.enabled', true);
  }

  get userScopes(): SummaryScope[] {
    return this._getConfigValue<SummaryScope[]>('intelliSense.completion.scopes', []);
  }

  get logScopesEnabled(): boolean {
    return this._getConfigValue<boolean>('intelliSense.completion.logScopes.enabled', false);
  }

  get logScopesMaxCommits(): number {
    return this.recentCommitsMaxItems;
  }

  get issuesPageSize(): number {
    return this._getConfigValue<number>('intelliSense.completion.issues.pageSize', 20);
  }

  get commitsPageSize(): number {
    return this.recentCommitsMaxItems;
  }

  get hoverEnabled(): boolean {
    return this._getConfigValue<boolean>('intelliSense.hover.enabled', true);
  }

  get removeType(): string[] {
    return this._getConfigValue('intelliSense.constants.removeType', []);
  }

  get summaryTypeOverrides(): SummaryTypeCustom[] {
    return this._getConfigValue('intelliSense.constants.summaryType', []);
  }

  get summaryCustomType(): CustomSummary<SummaryTypeCustom> {
    return this.convertCustomSummary('type', this.summaryTypeOverrides);
  }

  get summaryEmojiOverrides(): SummaryEmojiCustom[] {
    return this._getConfigValue('intelliSense.constants.summaryEmoji', []);
  }

  get summaryCustomEmoji(): CustomSummary<SummaryEmojiCustom> {
    return this.convertCustomSummary('code', this.summaryEmojiOverrides);
  }

  private convertCustomSummary<T extends Record<K, string>, K extends keyof T>(
    key: K,
    customTypeList: T[]
  ): CustomSummary<T> {
    return Object.fromEntries(customTypeList.map((e) => [e[key], e])) as CustomSummary<T>;
  }

  public isRequiredType<T extends object>(keys: string[], redefine: Partial<T>): boolean {
    const parameterName = keys as Array<keyof T>;
    return parameterName.every((name): boolean => {
      const targetProperty = redefine[name];

      return !(
        targetProperty === undefined ||
        (typeof targetProperty === 'string' && targetProperty.length === 0) ||
        (Array.isArray(targetProperty) && targetProperty.length === 0)
      );
    });
  }

  public updateUserScopes(userScopes: SummaryScope[]): Thenable<void> {
    return this._getConfig('intelliSense.completion').update(
      'scopes',
      userScopes,
      vscode.ConfigurationTarget.Workspace
    );
  }

  private _getConfig(section: string): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration(this._sectionPrefix + section);
  }

  private _getConfigValue<T>(section: string, defaultValue: T): T {
    const key = this._sectionPrefix + section;

    let value = this._cache.get(key);
    if (value === undefined) {
      const sections = section.split('.');
      const childSection = sections.pop() ?? '';
      const parentSection = sections.join('.');

      value = this._getConfig(parentSection).get<T>(childSection, defaultValue);
      this._cache.set(key, value);
    }

    return value;
  }

  private _onDidChangeConfiguration(event: vscode.ConfigurationChangeEvent): void {
    for (const key of this._cache.keys()) {
      if (event.affectsConfiguration(key)) {
        this._cache.delete(key);
      }
    }
  }
}

export default function getConfiguration(): Configuration {
  return new ConfigurationImpl();
}
