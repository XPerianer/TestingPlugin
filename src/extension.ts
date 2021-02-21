/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020-2021 Dominik Meier
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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
