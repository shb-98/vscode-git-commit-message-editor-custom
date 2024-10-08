import * as vscode from 'vscode';

import { SummaryScope, Configuration } from '../../configuration';

import { SUMMARY_TOKEN_SCOPE_REGEX } from '../parser/syntaxRegex';

import { Command } from '@phoihos/vsce-util';

export class CreateNewScopeCommand implements Command {
  public readonly id = 'gitCommitMessageEditorCustom.intelliSense.command.createNewScope';

  private readonly _scopeRangeRegex: RegExp;
  private readonly _config: Configuration;

  constructor(scopeRangeRegex: RegExp, config: Configuration) {
    this._scopeRangeRegex = scopeRangeRegex;
    this._config = config;
  }

  public async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor === undefined) return;

    const userScopes = this._config.userScopes;

    let scope = await vscode.window.showInputBox(this._getScopeInputBoxOptions(userScopes));
    if (scope === undefined) return;

    let description = await vscode.window.showInputBox(this._getDescInputBoxOptions(scope));
    if (description === undefined) return;

    scope = scope.trim();
    description = description.length > 0 ? description.trim() : undefined;

    await this._config.updateUserScopes(userScopes.concat({ scope, description }));

    const document = editor.document;
    const position = editor.selection.start;
    const insertRange = document.getWordRangeAtPosition(position, this._scopeRangeRegex);

    // escape `$`
    scope = '(' + scope.replace(/(\$)/g, '\\$') + ')';

    await editor.insertSnippet(new vscode.SnippetString(scope), insertRange);
  }

  private _getScopeInputBoxOptions(scopes: SummaryScope[]): vscode.InputBoxOptions {
    const lowerScopes = scopes.map((e) => e.scope.toLowerCase());

    return {
      placeHolder: 'Input new scope value',
      validateInput: (value): string => {
        if (value.length === 0) return 'Not allow empty value';

        const lowerScope = value.trim().toLowerCase();

        if (lowerScope.length === 0) return 'Not allow only whitespaces';
        if (lowerScope === '$') return 'Not allow only $';
        if (lowerScopes.includes(lowerScope)) return 'Already exists';

        return SUMMARY_TOKEN_SCOPE_REGEX.test(lowerScope)
          ? ''
          : 'Allow only words, underscores, hyphens and dots (can optionally begin with $)';
      }
    };
  }

  private _getDescInputBoxOptions(scope: string): vscode.InputBoxOptions {
    return {
      placeHolder: '(optional) Input the description for',
      prompt: `scope: "${scope}"`,
      validateInput: (value): string => {
        if (value.length === 0) return '';

        const desc = value.trim();
        if (desc.length === 0) return 'Not allow only whitespaces';

        return '';
      }
    };
  }
}
