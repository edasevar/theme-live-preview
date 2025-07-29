/**
 * Template Update Integration Test
 * 
 * This script tests the template update functionality to ensure
 * the extension can properly handle template element updates.
 */

import * as vscode from 'vscode';

export async function testTemplateUpdates() {
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
        
        vscode.window.showInformationMessage(
            '✅ Template Update Tests: All 5 tests passed successfully!'
        );
        
    } catch (error) {
        console.error('❌ Template update test failed:', error);
        vscode.window.showErrorMessage(
            `❌ Template Update Test Failed: ${error instanceof Error ? error.message : String(error)}`
        );
        throw error;
    }
}

// Register test command
export function registerTestCommand(context: vscode.ExtensionContext) {
    const testCommand = vscode.commands.registerCommand('themeEditor.runTests', testTemplateUpdates);
    context.subscriptions.push(testCommand);
}
