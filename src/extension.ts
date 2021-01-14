// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let panel: vscode.WebviewPanel | undefined;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('testingPlugin.start', () => {
			// Create and show a new webview
			panel = vscode.window.createWebviewPanel(
				'testingPlugin', // Identifies the type of the webview. Used internally
				'Testing Plugin', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{
					enableScripts: true,
					retainContextWhenHidden: false,
				}
			);
			panel.webview.html = getWebviewContext(panel.webview, context.extensionUri);
		}))
		if (vscode.window.registerWebviewPanelSerializer) {
			// Make sure we register a serializer in activation event
			vscode.window.registerWebviewPanelSerializer('testingPlugin', {
				async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
					panel = webviewPanel;
					panel.webview.html = getWebviewContext(webviewPanel.webview, context.extensionUri);
					panel.webview.postMessage({ command: 'refresh' });
					panel.webview.postMessage({ command: 'onDidChangeVisibleTextEditors',
						textEditors: vscode.window.visibleTextEditors.map(
						textEditor => ({filename: textEditor.document.fileName})
					)});
				}
			});
		}

	context.subscriptions.push(
		vscode.commands.registerCommand('testingPlugin.save', () => {
			vscode.commands.executeCommand('workbench.action.files.save')
			if (panel) {
				panel.webview.postMessage({ command: 'save' });
			}
		})
	)

	vscode.window.onDidChangeVisibleTextEditors(
		textEditors => {
			if (panel) {
				panel.webview.postMessage({ command: 'onDidChangeVisibleTextEditors',
				textEditors: textEditors.map(
					textEditor => ({filename: textEditor.document.fileName})
				)});
			}
		}
	);

};

// this method is called when your extension is deactivated
export function deactivate() { }


function getWebviewContext(webview: vscode.Webview, extensionsUri: vscode.Uri) {
	// Local path to main script run in the webview
	const scriptPathOnDisk = vscode.Uri.joinPath(extensionsUri, 'src', 'web', 'script.js');

	// And the uri we use to load this script in the webview
	const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

return `
<!doctype html>

<html>
<head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.js"></script>
	<script src="https://d3js.org/d3.v5.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.20/lodash.min.js"></script>
</head>

<body>
	<svg id="chart" width="300" height="800"></svg>
	<script src="${scriptUri}"></script>
</body>

</html>`
	}