import * as vscode from 'vscode';
import { ThemeEditorPanel } from './panel/ThemeEditorPanel';
import { ThemeManager } from './utils/themeManager';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const extensionUri = vscode.Uri.file(context.extensionPath);
	const themeManager = new ThemeManager(context);

	// Register all commands
	const commands = [
		vscode.commands.registerCommand('themeEditor.open', () => {
			ThemeEditorPanel.createOrShow(extensionUri, themeManager);
8		}),
		
   vscode.commands.registerCommand('themeEditor.loadTheme', async () => {
	  const options: vscode.OpenDialogOptions = {
				canSelectMany: false,
				openLabel: 'Load Theme',
				filters: {
					'Theme Files': ['json', 'jsonc'],
					'VS Code Extension': ['vsix'],
					'CSS Files': ['css'],
					'All Files': ['*']
				}
			};

			const fileUri = await vscode.window.showOpenDialog(options);
	   if (fileUri && fileUri[0]) {
		  try {
				// Load and apply theme file to VS Code settings
				await themeManager.applyThemeFromFile(fileUri[0].fsPath);
			 vscode.window.showInformationMessage('Theme applied successfully!');
					
					// Refresh the panel if it's open
				if (ThemeEditorPanel.currentPanel) {
				   ThemeEditorPanel.currentPanel.refresh();
				   // Notify webview UI
				   ThemeEditorPanel.currentPanel.postMessage({ type: 'themeLoaded' });
				}
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to load theme: ${error}`);
				}
			}
		}),

		vscode.commands.registerCommand('themeEditor.exportTheme', async () => {
			const options: vscode.SaveDialogOptions = {
				saveLabel: 'Export Theme',
				filters: {
					'JSON Files': ['json']
				},
				defaultUri: vscode.Uri.file(path.join(
					vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 
					'my-custom-theme.json'
				))
			};

			const fileUri = await vscode.window.showSaveDialog(options);
			if (fileUri) {
				try {
				   await themeManager.exportTheme(fileUri.fsPath);
				   vscode.window.showInformationMessage(`Theme exported to ${fileUri.fsPath}`);
				   // Notify webview UI
				   if (ThemeEditorPanel.currentPanel) {
					   ThemeEditorPanel.currentPanel.postMessage({ type: 'themeExported' });
				   }
				} catch (error) {
					vscode.window.showErrorMessage(`Failed to export theme: ${error}`);
				}
			}
		}),

		vscode.commands.registerCommand('themeEditor.resetTheme', async () => {
			const result = await vscode.window.showWarningMessage(
				'This will reset all custom colors to default. Continue?',
				'Yes', 'Cancel'
			);
			
			if (result === 'Yes') {
				await themeManager.resetTheme();
				vscode.window.showInformationMessage('Theme reset to default!');
				
				// Refresh the panel if it's open
				if (ThemeEditorPanel.currentPanel) {
					ThemeEditorPanel.currentPanel.refresh();
				}
			}
		})
	];

	// Add all commands to subscriptions
	commands.forEach(command => context.subscriptions.push(command));

	// Show welcome message on first activation
	const hasShownWelcome = context.globalState.get('themeEditor.hasShownWelcome', false);
	if (!hasShownWelcome) {
		vscode.window.showInformationMessage(
			'Theme Editor Live is now active! Use "Open Theme Editor Live" command to start editing.',
			'Open Editor'
		).then(selection => {
			if (selection === 'Open Editor') {
				vscode.commands.executeCommand('themeEditor.open');
			}
		});
		context.globalState.update('themeEditor.hasShownWelcome', true);
	}
}

export function deactivate() {
	// Clean up resources if needed
}
