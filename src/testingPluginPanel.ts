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
import { pathToFileURL } from 'url';
import * as vscode from 'vscode';
import { relative, join } from 'path';

export default class TestingPluginPanel {
	public static currentPanel: TestingPluginPanel | undefined;
	public static config = vscode.workspace.getConfiguration('testingPlugin');

	private readonly panel: vscode.WebviewPanel;
	private disposables: vscode.Disposable[] = [];

	public static readonly viewType = 'testingPlugin';

	public static createOrShow(extensionUri: vscode.Uri) {

		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		// If we already have a panel, show it.
		if (TestingPluginPanel.currentPanel) {
			TestingPluginPanel.currentPanel.panel.reveal(column);
			return;
		}

		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(
			TestingPluginPanel.viewType,
			'Testing Plugin',
			column || vscode.ViewColumn.One,
			{
				enableScripts: true,
				retainContextWhenHidden: false,
			}
		);


		TestingPluginPanel.currentPanel = new TestingPluginPanel(panel, extensionUri);
	}

	public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		TestingPluginPanel.currentPanel = new TestingPluginPanel(panel, extensionUri);
	}

	public static save() {
		if (this.currentPanel) {
			this.currentPanel.save();
		}
	}

	public static onDidChangeVisibleTextEditors(textEditors: vscode.TextEditor[]) {
		if (this.currentPanel) {
			this.currentPanel.onDidChangeVisibleTextEditors(textEditors);
		}
	}

	public static onDidChangeTextEditorVisibleRanges(change: vscode.TextEditorVisibleRangesChangeEvent) {
		if (this.currentPanel && this.config.get("relevancyGranularity") === 'lineBased') {
			this.currentPanel.onDidChangeTextEditorVisibleRanges(change);
		}
	}

	public constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
		this.panel = panel;
		panel.webview.html = this.getWebviewContext(panel.webview, extensionUri);

		// Update to current config
		TestingPluginPanel.config = vscode.workspace.getConfiguration('testingPlugin');
		// Set correct visualization function:
		panel.webview.postMessage({ command: 'onSwitchVisualizationFunction', visualization: TestingPluginPanel.config.get("visualizationFunction") });
		
		// And set some other options
		panel.webview.postMessage({ command: 'onSetOption', 'key': 'desaturate', value: TestingPluginPanel.config.get("desaturateAccordingToTimestamp")});

		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

		// Handle messages from the webview
		this.panel.webview.onDidReceiveMessage(
			message => {
				switch (message.command) {
					case 'onClick':
						this.onClick(message.test);
						return;
				}
			},
			null,
			this.disposables
		);
	}

	public getPanel() {
		return this.panel;
	}

	private onClick(testIdentifier: string) {
		let [relativePath, testName] = testIdentifier.split('::');
		let testPath = join(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.path : "", relativePath);
		vscode.workspace.openTextDocument(testPath).then(textDocument => {
			vscode.window.showTextDocument(textDocument, vscode.ViewColumn.One, true).then(
				textEditor => {
					let content = textDocument.getText();
					let lines = content.split('\n');
					let lineIndex = lines.findIndex(line => line.includes(testName));
					if (lineIndex) {
						textEditor.revealRange(new vscode.Range(lineIndex, 0, lineIndex + 5, 0), vscode.TextEditorRevealType.AtTop);
					}
				}
			);
		});
	}

	private save() {
		vscode.commands.executeCommand('workbench.action.files.save');
		this.panel.webview.postMessage({ command: 'save' });
	}

	public dispose() {
		TestingPluginPanel.currentPanel = undefined;

		// Clean up our resources
		this.panel.dispose();

		while (this.disposables.length) {
			const x = this.disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private onDidChangeVisibleTextEditors(textEditors: vscode.TextEditor[]) {
		this.panel.webview.postMessage({
			command: 'onDidChangeVisibleTextEditors',
			textEditors: textEditors.map(
				textEditor => ({ filename: relative(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.path : "", textEditor.document.fileName) })
			)
		});
	}

	private onDidChangeTextEditorVisibleRanges(change: vscode.TextEditorVisibleRangesChangeEvent) {
		let visibleStrings = change.visibleRanges.map(visibleRange => change.textEditor.document.getText(visibleRange));
		// Using a Regex Heuristic to find names of methods in visible ranges fast
		let visibleMethodNames = visibleStrings.map(s => s.match(/(?<=def ).*(?=\(.*\):)/g));
		let data = {
			command: 'onDidChangeTextEditorVisibleRanges',
			filename: relative(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.path : "", change.textEditor.document.fileName),
			visibleMethodNames: (visibleMethodNames as any).flat() // Typescript Type system does not know the Array flat method
		};
		this.panel.webview.postMessage(data);
	}

	private getWebviewContext(webview: vscode.Webview, extensionsUri: vscode.Uri) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.joinPath(extensionsUri, 'src', 'web', 'script.js');
	
		// And the uri we use to load this script in the webview
		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
	
		return `
	<!doctype html>
	
	<html>
	<head>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
		<script src="https://d3js.org/d3.v6.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"></script>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/tinycolor/1.4.2/tinycolor.min.js"></script>
	</head>
	
	<body>
		<script src="${scriptUri}"></script>
	</body>
	
	</html>`;
	}
}



