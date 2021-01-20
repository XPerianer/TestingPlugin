// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { pathToFileURL } from 'url';
import * as vscode from 'vscode';
import { relative } from 'path';
import { Test } from 'mocha';

import TestingPluginPanel from './testingPluginPanel';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('testingPlugin.start', () => {
			TestingPluginPanel.createOrShow(context.extensionUri);
		}))
	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer('testingPlugin', {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				TestingPluginPanel.revive(webviewPanel, context.extensionUri);
			}
		});
	}

	context.subscriptions.push(
		vscode.commands.registerCommand('testingPlugin.save', () => {
			TestingPluginPanel.save();
		})
	)

	// Register to change events
	vscode.window.onDidChangeVisibleTextEditors(TestingPluginPanel.onDidChangeVisibleTextEditors.bind(TestingPluginPanel));
	vscode.window.onDidChangeTextEditorVisibleRanges(TestingPluginPanel.onDidChangeTextEditorVisibleRanges.bind(TestingPluginPanel));
};

export function deactivate() { }
