// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
	ExtensionContext,
	window,
	commands,
  } from "vscode";

import { createVocab } from "./vocab";
import { VocabDataProvider } from "./view";


export function activate(context: ExtensionContext) {
	(async () => {
		const vocabDataProvider = new VocabDataProvider();
		window.registerTreeDataProvider('vocabulary', vocabDataProvider);
		commands.registerCommand('vocab-explorer.refreshEntry', () =>
			vocabDataProvider.refresh()
		);
	})();
}

// this method is called when your extension is deactivated
export function deactivate() {}
