import * as vscode from 'vscode';
import { ThemeEditorPanel } from './panel/ThemeEditorPanel';
import { ThemeManager } from './utils/themeManager';
import { ThemeEditorTreeProvider } from './views/ThemeEditorTreeProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Theme Editor Live: Starting activation');
	
	let extensionUri: vscode.Uri;
	let themeManager: ThemeManager;
	let treeProvider: ThemeEditorTreeProvider;
	
	try {
		extensionUri = vscode.Uri.file(context.extensionPath);
		console.log('Theme Editor Live: Extension URI created:', extensionUri.fsPath);
		
		themeManager = new ThemeManager(context);
		console.log('Theme Editor Live: ThemeManager created');
		
		// Create and register tree provider
		treeProvider = new ThemeEditorTreeProvider(context);
		vscode.window.registerTreeDataProvider('themeEditorView', treeProvider);
		console.log('Theme Editor Live: Tree provider registered');
	} catch (error) {
		console.error('Theme Editor Live: Failed to initialize basic components:', error);
		vscode.window.showErrorMessage(`Failed to initialize Theme Editor: ${error instanceof Error ? error.message : String(error)}`);
		return;
	}

	// Register open command
	const openCommand = vscode.commands.registerCommand('themeEditor.open', () => {
		console.log('Theme Editor Live: Opening theme editor');
		try {
			ThemeEditorPanel.createOrShow(extensionUri, themeManager);
		} catch (error) {
			console.error('Failed to open Theme Editor:', error);
			vscode.window.showErrorMessage(`Failed to open Theme Editor: ${error instanceof Error ? error.message : String(error)}`);
		}
	});
	
	// Register cleanup command
	const cleanupCommand = vscode.commands.registerCommand('themeEditor.cleanupSettings', async () => {
		console.log('Theme Editor Live: Running settings cleanup');
		try {
			await themeManager.cleanupLegacySettings();   // now strongly typed
			vscode.window.showInformationMessage('Theme Editor: Legacy settings cleaned up successfully!');
		} catch (error) {
			console.error('Failed to cleanup settings:', error);
			vscode.window.showErrorMessage(`Failed to cleanup settings: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Template management commands
	const reloadTemplateCommand = vscode.commands.registerCommand('themeEditor.reloadTemplate', async () => {
		console.log('Theme Editor Live: Reloading template');
		try {
			await themeManager.reloadTemplate();
			const stats = themeManager.getTemplateStats();
			vscode.window.showInformationMessage(`Template reloaded successfully: ${stats.total} elements (${stats.colors} colors, ${stats.semanticTokenColors} semantic tokens, ${stats.tokenColors} TextMate tokens)`);
		} catch (error) {
			console.error('Failed to reload template:', error);
			vscode.window.showErrorMessage(`Failed to reload template: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	const syncTemplateCommand = vscode.commands.registerCommand('themeEditor.syncTemplate', () => {
		console.log('Theme Editor Live: Syncing template with UI');
		try {
			themeManager.syncTemplateWithUI();
			vscode.window.showInformationMessage('Template synced with UI successfully');
		} catch (error) {
			console.error('Failed to sync template:', error);
			vscode.window.showErrorMessage(`Failed to sync template: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	const templateStatsCommand = vscode.commands.registerCommand('themeEditor.templateStats', () => {
		console.log('Theme Editor Live: Showing template stats');
		try {
			const stats = themeManager.getTemplateStats();
			vscode.window.showInformationMessage(
				`Template Statistics:\n• Colors: ${stats.colors}\n• Semantic Tokens: ${stats.semanticTokenColors}\n• TextMate Tokens: ${stats.tokenColors}\n• Total: ${stats.total}`,
				{ modal: true }
			);
		} catch (error) {
			console.error('Failed to get template stats:', error);
			vscode.window.showErrorMessage(`Failed to get template stats: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Refresh webview command
	const refreshWebviewCommand = vscode.commands.registerCommand('themeEditor.refreshWebview', () => {
		console.log('Theme Editor Live: Refreshing webview');
		try {
			if (ThemeEditorPanel.currentPanel) {
				ThemeEditorPanel.currentPanel.refresh();
				vscode.window.showInformationMessage('Theme Editor webview refreshed successfully');
			} else {
				vscode.window.showWarningMessage('Theme Editor is not currently open');
			}
		} catch (error) {
			console.error('Failed to refresh webview:', error);
			vscode.window.showErrorMessage(`Failed to refresh webview: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Sidebar command
	const openFromSidebarCommand = vscode.commands.registerCommand('themeEditor.openFromSidebar', () => {
		console.log('Theme Editor Live: Opening from sidebar');
		vscode.commands.executeCommand('themeEditor.open');
	});

	// Color editing command for sidebar
	const editColorCommand = vscode.commands.registerCommand('themeEditor.editColor', async (colorType: string, colorKey: string) => {
		console.log(`Theme Editor Live: Editing color ${colorType}.${colorKey}`);
		try {
			const currentConfig = vscode.workspace.getConfiguration();
			let currentValue: string | undefined;
			
			// Get current color value based on type
			if (colorType === 'workbench') {
				currentValue = currentConfig.get(`workbench.colorCustomizations.${colorKey}`);
			} else if (colorType === 'semantic') {
				const semanticConfig = currentConfig.get('editor.semanticTokenColorCustomizations.rules') as Array<{token: string, foreground: string}>;
				const rule = semanticConfig?.find((r: {token: string, foreground: string}) => r.token === colorKey);
				currentValue = rule?.foreground;
			}

			// Show input box for color editing
			const newColor = await vscode.window.showInputBox({
				prompt: `Enter color for ${colorKey}`,
				placeHolder: 'e.g., #ff0000, #ff000080 (with alpha), or color name',
				value: currentValue || '#ffffff',
				validateInput: (value: string) => {
					// Basic hex color validation
					if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value)) {
						return 'Please enter a valid hex color (e.g., #ff0000)';
					}
					return undefined;
				}
			});

			if (newColor) {
				// Apply the color change
				if (colorType === 'workbench') {
					const workbenchConfig = currentConfig.get('workbench.colorCustomizations') as Record<string, string> || {};
					workbenchConfig[colorKey] = newColor;
					await currentConfig.update('workbench.colorCustomizations', workbenchConfig, vscode.ConfigurationTarget.Global);
				} else if (colorType === 'semantic') {
					const semanticConfig = currentConfig.get('editor.semanticTokenColorCustomizations.rules') as Array<{token: string, foreground: string}> || [];
					const existingIndex = semanticConfig.findIndex((r: {token: string, foreground: string}) => r.token === colorKey);
					
					if (existingIndex >= 0) {
						semanticConfig[existingIndex].foreground = newColor;
					} else {
						semanticConfig.push({ token: colorKey, foreground: newColor });
					}
					
					await currentConfig.update('editor.semanticTokenColorCustomizations', { rules: semanticConfig }, vscode.ConfigurationTarget.Global);
				}

				vscode.window.showInformationMessage(`Updated ${colorKey} to ${newColor}`);
				
				// Refresh tree to show changes
				treeProvider.refresh();
			}
		} catch (error) {
			console.error('Failed to edit color:', error);
			vscode.window.showErrorMessage(`Failed to edit color: ${error instanceof Error ? error.message : String(error)}`);
		}
	});

	// Register commands
	context.subscriptions.push(
		openCommand, 
		cleanupCommand,
		reloadTemplateCommand,
		syncTemplateCommand,
		templateStatsCommand,
		refreshWebviewCommand,
		openFromSidebarCommand,
		editColorCommand
	);
	
	console.log('Theme Editor Live: Commands registered successfully');
	
	// Show welcome message on first activation
	try {
		const hasShownWelcome = context.globalState.get('themeEditor.hasShownWelcome', false);
		if (!hasShownWelcome) {
			vscode.window.showInformationMessage(
				'Theme Editor Live is now active! Use "Theme Editor Live: Open" command to start editing.',
				'Open Editor'
			).then(selection => {
				if (selection === 'Open Editor') {
					vscode.commands.executeCommand('themeEditor.open');
				}
			});
			context.globalState.update('themeEditor.hasShownWelcome', true);
		}
	} catch (error) {
		console.error('Theme Editor Live: Failed to show welcome message:', error);
	}
	
	console.log('Theme Editor Live: Extension activated successfully');
}

export function deactivate() {
	// Clean up resources if needed
}
