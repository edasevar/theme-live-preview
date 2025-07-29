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
    // TEST COMMAND: Register test command for debugging TextMate updates
    const testCommand = vscode.commands.registerCommand('themeEditor.testUpdate', async () => {
        console.log('Testing TextMate color update with DIRECT FILE MANIPULATION...');
        const os = require('os');
        const path = require('path');
        const fs = require('fs');
        // Direct file manipulation - bypass VS Code API completely
        const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
        console.log('Settings file path:', settingsPath);
        try {
            // Read the current settings
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            console.log('Settings file read successfully');
            const scope = "token.debug-token";
            const newValue = "#ffffff";
            // Check if the token exists
            if (settingsContent.includes(`"scope": "${scope}"`)) {
                console.log(`Found ${scope} in settings`);
                // Replace the color value using the exact same regex as our working manual script
                const updatedContent = settingsContent.replace(new RegExp(`("scope":\\s*"${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"foreground":\\s*)"[^"]*"`, 'g'), `$1"${newValue}"`);
                if (updatedContent !== settingsContent) {
                    // Write the updated content
                    fs.writeFileSync(settingsPath, updatedContent, 'utf8');
                    console.log(`Successfully updated ${scope} to ${newValue}!`);
                    vscode.window.showInformationMessage(`SUCCESS: Updated ${scope} to ${newValue} via direct file manipulation!`);
                }
                else {
                    console.log('No changes made - content was identical');
                    vscode.window.showWarningMessage('No changes detected in the file');
                }
            }
            else {
                console.log(`${scope} not found in settings`);
                vscode.window.showErrorMessage(`Token ${scope} not found in settings file`);
            }
        }
        catch (error) {
            console.error('Error updating settings file:', error);
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    });
    // NUCLEAR OPTION TEST: Test the ThemeManager nuclear option
    const nuclearTestCommand = vscode.commands.registerCommand('themeEditor.nuclearTest', async () => {
        console.log('Testing ThemeManager nuclear option...');
        try {
            // Test changing token.debug-token to bright green
            const testColor = '#00ff00'; // bright green
            await themeManager.applyTextMateColor('token.debug-token', testColor);
            vscode.window.showInformationMessage(`NUCLEAR SUCCESS! Changed token.debug-token to ${testColor}`);
        }
        catch (error) {
            console.error('Nuclear test failed:', error);
            vscode.window.showErrorMessage(`Nuclear test FAILED: ${error}`);
        }
    });
    // COMPREHENSIVE TEST: Test all three nuclear options
    const allNuclearTestCommand = vscode.commands.registerCommand('themeEditor.testAllNuclear', async () => {
        console.log('Testing ALL nuclear options (semantic, textmate, workbench)...');
        try {
            // Test 1: Semantic token (turn class tokens bright red)
            await themeManager.applyLiveColor('semantic_class', '#ff0000');
            console.log('✅ Semantic token test complete');
            // Test 2: TextMate token (turn debug token bright blue)
            await themeManager.applyLiveColor('textmate_token.debug-token', '#0000ff');
            console.log('✅ TextMate token test complete');
            // Test 3: Workbench color (turn editor background dark green)
            await themeManager.applyLiveColor('editor.background', '#001100');
            console.log('✅ Workbench color test complete');
            vscode.window.showInformationMessage(`🚀 ALL NUCLEAR TESTS COMPLETE! Check your settings - everything should update!`);
        }
        catch (error) {
            console.error('Nuclear tests failed:', error);
            vscode.window.showErrorMessage(`Nuclear tests FAILED: ${error}`);
        }
    });
    context.subscriptions.push(openCommand, cleanupCommand, testCommand, nuclearTestCommand, allNuclearTestCommand);
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