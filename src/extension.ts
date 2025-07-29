import * as vscode from 'vscode';
import { ThemeEditorPanel } from './panel/ThemeEditorPanel';
import { ThemeManager } from './utils/themeManager';

export function activate(context: vscode.ExtensionContext) {
	console.log('Theme Editor Live: Starting activation');
	
	let extensionUri: vscode.Uri;
	let themeManager: ThemeManager;
	
	try {
		extensionUri = vscode.Uri.file(context.extensionPath);
		console.log('Theme Editor Live: Extension URI created:', extensionUri.fsPath);
		
		themeManager = new ThemeManager(context);
		console.log('Theme Editor Live: ThemeManager created');
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
			await (themeManager as any).cleanupLegacySettings();
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

	// Register commands
	context.subscriptions.push(
		openCommand, 
		cleanupCommand,
		reloadTemplateCommand,
		syncTemplateCommand,
		templateStatsCommand
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
