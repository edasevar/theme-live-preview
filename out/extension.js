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
const path = __importStar(require("path"));
function activate(context) {
    const extensionUri = vscode.Uri.file(context.extensionPath);
    const themeManager = new themeManager_1.ThemeManager(context);
    // Register all commands
    const commands = [
        vscode.commands.registerCommand('themeEditor.open', () => {
            ThemeEditorPanel_1.ThemeEditorPanel.createOrShow(extensionUri, themeManager);
            8;
        }),
        vscode.commands.registerCommand('themeEditor.loadTheme', async () => {
            const options = {
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
                    if (ThemeEditorPanel_1.ThemeEditorPanel.currentPanel) {
                        ThemeEditorPanel_1.ThemeEditorPanel.currentPanel.refresh();
                        // Notify webview UI
                        ThemeEditorPanel_1.ThemeEditorPanel.currentPanel.postMessage({ type: 'themeLoaded' });
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Failed to load theme: ${error}`);
                }
            }
        }),
        vscode.commands.registerCommand('themeEditor.exportTheme', async () => {
            const options = {
                saveLabel: 'Export Theme',
                filters: {
                    'JSON Files': ['json']
                },
                defaultUri: vscode.Uri.file(path.join(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '', 'my-custom-theme.json'))
            };
            const fileUri = await vscode.window.showSaveDialog(options);
            if (fileUri) {
                try {
                    await themeManager.exportTheme(fileUri.fsPath);
                    vscode.window.showInformationMessage(`Theme exported to ${fileUri.fsPath}`);
                    // Notify webview UI
                    if (ThemeEditorPanel_1.ThemeEditorPanel.currentPanel) {
                        ThemeEditorPanel_1.ThemeEditorPanel.currentPanel.postMessage({ type: 'themeExported' });
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Failed to export theme: ${error}`);
                }
            }
        }),
        vscode.commands.registerCommand('themeEditor.resetTheme', async () => {
            const result = await vscode.window.showWarningMessage('This will reset all custom colors to default. Continue?', 'Yes', 'Cancel');
            if (result === 'Yes') {
                await themeManager.resetTheme();
                vscode.window.showInformationMessage('Theme reset to default!');
                // Refresh the panel if it's open
                if (ThemeEditorPanel_1.ThemeEditorPanel.currentPanel) {
                    ThemeEditorPanel_1.ThemeEditorPanel.currentPanel.refresh();
                }
            }
        })
    ];
    // Add all commands to subscriptions
    commands.forEach(command => context.subscriptions.push(command));
    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('themeEditor.hasShownWelcome', false);
    if (!hasShownWelcome) {
        vscode.window.showInformationMessage('Theme Editor Live is now active! Use "Open Theme Editor Live" command to start editing.', 'Open Editor').then(selection => {
            if (selection === 'Open Editor') {
                vscode.commands.executeCommand('themeEditor.open');
            }
        });
        context.globalState.update('themeEditor.hasShownWelcome', true);
    }
}
function deactivate() {
    // Clean up resources if needed
}
//# sourceMappingURL=extension.js.map