"use strict";
/**
 * Template Update Integration Test
 *
 * This script tests the template update functionality to ensure
 * the extension can properly handle template element updates.
 */
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
exports.testTemplateUpdates = testTemplateUpdates;
exports.registerTestCommand = registerTestCommand;
const vscode = __importStar(require("vscode"));
async function testTemplateUpdates() {
    console.log('🧪 Starting Template Update Integration Tests...');
    try {
        // Test 1: Reload Template Command
        console.log('📋 Test 1: Template Reload');
        await vscode.commands.executeCommand('themeEditor.reloadTemplate');
        console.log('✅ Template reload completed');
        // Test 2: Template Statistics
        console.log('📊 Test 2: Template Statistics');
        await vscode.commands.executeCommand('themeEditor.templateStats');
        console.log('✅ Template stats displayed');
        // Test 3: Template Sync
        console.log('🔄 Test 3: Template Sync');
        await vscode.commands.executeCommand('themeEditor.syncTemplate');
        console.log('✅ Template sync completed');
        // Test 4: Debug Logs
        console.log('🐛 Test 4: Debug Log Functionality');
        await vscode.commands.executeCommand('themeEditor.showLogs');
        console.log('✅ Debug logs displayed');
        // Test 5: Clear Logs
        console.log('🧹 Test 5: Clear Debug Log');
        await vscode.commands.executeCommand('themeEditor.clearLogs');
        console.log('✅ Debug logs cleared');
        console.log('🎉 All template update tests passed!');
        vscode.window.showInformationMessage('✅ Template Update Tests: All 5 tests passed successfully!');
    }
    catch (error) {
        console.error('❌ Template update test failed:', error);
        vscode.window.showErrorMessage(`❌ Template Update Test Failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}
// Register test command
function registerTestCommand(context) {
    const testCommand = vscode.commands.registerCommand('themeEditor.runTests', testTemplateUpdates);
    context.subscriptions.push(testCommand);
}
//# sourceMappingURL=integration.js.map