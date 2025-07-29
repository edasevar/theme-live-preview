"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const ThemeEditorPanel_1 = require("./panel/ThemeEditorPanel");
const themeManager_1 = require("./utils/themeManager");
function activate(context) {
    console.log('Theme Editor Live: Starting activation');
    let extensionUri;
    let themeManager;
    try {
        extensionUri = vscode.Uri.file(context.extensionPath);
        console.log('Theme Editor Live: Extension URI created:', extensionUri.fsPath);
        themeManager = new themeManager_1.ThemeManager(context);
        console.log('Theme Editor Live: ThemeManager created');
    }
    catch (error) {
        console.error('Theme Editor Live: Failed to initialize basic components:', error);
        vscode.window.showErrorMessage(`Failed to initialize Theme Editor: ${error instanceof Error ? error.message : String(error)}`);
        return;
    }
    // Register open command
    const openCommand = vscode.commands.registerCommand('themeEditor.open', () => {
        console.log('Theme Editor Live: Opening theme editor');
        try {
            ThemeEditorPanel_1.ThemeEditorPanel.createOrShow(extensionUri, themeManager);
        }
        catch (error) {
            console.error('Failed to open Theme Editor:', error);
            vscode.window.showErrorMessage(`Failed to open Theme Editor: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    // Register cleanup command
    const cleanupCommand = vscode.commands.registerCommand('themeEditor.cleanupSettings', async () => {
        console.log('Theme Editor Live: Running settings cleanup');
        try {
            await themeManager.cleanupLegacySettings();
            vscode.window.showInformationMessage('Theme Editor: Legacy settings cleaned up successfully!');
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('Failed to reload template:', error);
            vscode.window.showErrorMessage(`Failed to reload template: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    const syncTemplateCommand = vscode.commands.registerCommand('themeEditor.syncTemplate', () => {
        console.log('Theme Editor Live: Syncing template with UI');
        try {
            themeManager.syncTemplateWithUI();
            vscode.window.showInformationMessage('Template synced with UI successfully');
        }
        catch (error) {
            console.error('Failed to sync template:', error);
            vscode.window.showErrorMessage(`Failed to sync template: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    const templateStatsCommand = vscode.commands.registerCommand('themeEditor.templateStats', () => {
        console.log('Theme Editor Live: Showing template stats');
        try {
            const stats = themeManager.getTemplateStats();
            vscode.window.showInformationMessage(`Template Statistics:\n• Colors: ${stats.colors}\n• Semantic Tokens: ${stats.semanticTokenColors}\n• TextMate Tokens: ${stats.tokenColors}\n• Total: ${stats.total}`, { modal: true });
        }
        catch (error) {
            console.error('Failed to get template stats:', error);
            vscode.window.showErrorMessage(`Failed to get template stats: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    // Refresh webview command
    const refreshWebviewCommand = vscode.commands.registerCommand('themeEditor.refreshWebview', () => {
        console.log('Theme Editor Live: Refreshing webview');
        try {
            if (ThemeEditorPanel_1.ThemeEditorPanel.currentPanel) {
                ThemeEditorPanel_1.ThemeEditorPanel.currentPanel.refresh();
                vscode.window.showInformationMessage('Theme Editor webview refreshed successfully');
            }
            else {
                vscode.window.showWarningMessage('Theme Editor is not currently open');
            }
        }
        catch (error) {
            console.error('Failed to refresh webview:', error);
            vscode.window.showErrorMessage(`Failed to refresh webview: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
    // Register commands
    context.subscriptions.push(openCommand, cleanupCommand, reloadTemplateCommand, syncTemplateCommand, templateStatsCommand, refreshWebviewCommand);
    console.log('Theme Editor Live: Commands registered successfully');
    // Show welcome message on first activation
    try {
        const hasShownWelcome = context.globalState.get('themeEditor.hasShownWelcome', false);
        if (!hasShownWelcome) {
            vscode.window.showInformationMessage('Theme Editor Live is now active! Use "Theme Editor Live: Open" command to start editing.', 'Open Editor').then(selection => {
                if (selection === 'Open Editor') {
                    vscode.commands.executeCommand('themeEditor.open');
                }
            });
            context.globalState.update('themeEditor.hasShownWelcome', true);
        }
    }
    catch (error) {
        console.error('Theme Editor Live: Failed to show welcome message:', error);
    }
    console.log('Theme Editor Live: Extension activated successfully');
}
function deactivate() {
    // Clean up resources if needed
}
//# sourceMappingURL=extension.js.map