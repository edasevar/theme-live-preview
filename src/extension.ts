import * as vscode from "vscode";
import { getWebviewContent } from "./webviewContent";
import { themeElements } from "./schema";

export function activate (context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("theme-live-preview.open", () => {
			const panel = vscode.window.createWebviewPanel(
				"themeLivePreview",
				"Theme Live Preview",
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, "media")]
				}
			);

			panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
			panel.webview.postMessage({ elements: themeElements });

			panel.webview.onDidReceiveMessage(msg => {
				if (msg.type === "colorChange") {
					console.log(`Changed ${msg.key} to ${msg.color}`);
					// TODO: Live update or preview will go here
				}
			});
		})
	);
}

export function deactivate () {}
