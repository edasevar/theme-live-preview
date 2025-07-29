/**
 * Test Template Update Capabilities
 * 
 * This script demonstrates how to use the enhanced template management features
 * to programmatically update template elements and sync them with the UI.
 */

const vscode = require('vscode');

async function testTemplateUpdateCapabilities() {
    console.log('🧪 Testing Template Update Capabilities...');
    
    try {
        // Test 1: Reload Template
        console.log('📁 Test 1: Reloading template from TEMPLATE.jsonc...');
        await vscode.commands.executeCommand('themeEditor.reloadTemplate');
        console.log('✅ Template reloaded successfully');
        
        // Test 2: Show Template Stats
        console.log('📊 Test 2: Getting template statistics...');
        await vscode.commands.executeCommand('themeEditor.templateStats');
        console.log('✅ Template stats retrieved successfully');
        
        // Test 3: Sync Template with UI
        console.log('🔄 Test 3: Syncing template with UI...');
        await vscode.commands.executeCommand('themeEditor.syncTemplate');
        console.log('✅ Template synced with UI successfully');
        
        console.log('🎉 All template update tests completed successfully!');
        
        // Test 4: Demonstrate programmatic template element updates
        console.log('⚙️ Test 4: Testing programmatic template updates...');
        
        // Get the extension and access the theme manager
        const extension = vscode.extensions.getExtension('theme-editor-live');
        if (extension && extension.isActive) {
            const themeManager = extension.exports?.themeManager;
            if (themeManager) {
                // Test updating a workbench color template element
                await themeManager.updateTemplateElement(
                    'colors',
                    'editor.background',
                    '#001122',
                    false // Don't apply immediately, just update template
                );
                console.log('✅ Workbench color template element updated');
                
                // Test updating a semantic token template element
                await themeManager.updateTemplateElement(
                    'semanticTokenColors',
                    'variable',
                    '#ff6600',
                    true // Apply immediately to current theme
                );
                console.log('✅ Semantic token template element updated and applied');
                
                // Test updating a TextMate token template element
                await themeManager.updateTemplateElement(
                    'tokenColors',
                    'comment',
                    { foreground: '#888888', fontStyle: 'italic' },
                    false
                );
                console.log('✅ TextMate token template element updated');
                
                // Get updated stats
                const stats = themeManager.getTemplateStats();
                console.log(`📈 Template now contains: ${stats.total} total elements`);
                console.log(`   • Colors: ${stats.colors}`);
                console.log(`   • Semantic Tokens: ${stats.semanticTokenColors}`);
                console.log(`   • TextMate Tokens: ${stats.tokenColors}`);
            } else {
                console.log('⚠️ ThemeManager not accessible from extension exports');
            }
        } else {
            console.log('⚠️ Theme Editor Live extension not found or not active');
        }
        
        console.log('🎊 All template update capability tests completed!');
        
    } catch (error) {
        console.error('❌ Template update test failed:', error);
        throw error;
    }
}

// Example usage scenarios
function demonstrateUseCases() {
    console.log(`
📚 Template Update Use Cases:

1. 🔄 Automatic Template Reload:
   - When TEMPLATE.jsonc is modified, use 'reloadTemplate()' to refresh
   - Useful for development workflows and dynamic template updates

2. 🎨 Live Template Element Updates:
   - Update individual template elements with 'updateTemplateElement()'
   - Choose whether to apply changes immediately or just update template
   - Perfect for theme generation tools and automated workflows

3. 🔗 Template-UI Synchronization:
   - Use 'syncTemplateWithUI()' to ensure UI reflects latest template
   - Emit change events for all template elements
   - Essential for maintaining consistency between template and active theme

4. 📊 Template Monitoring:
   - Get real-time statistics with 'getTemplateStats()'
   - Track template elements count across all categories
   - Useful for template validation and debugging

5. 🛠️ Programmatic Theme Management:
   - Build tools that automatically update templates
   - Create theme generators that modify base templates
   - Implement template-based theme inheritance systems

💡 All these capabilities ensure that extensions can handle template 
   element updates dynamically, maintaining consistency between the 
   template file and the active theme configuration.
    `);
}

// If running directly, execute the test
if (require.main === module) {
    testTemplateUpdateCapabilities()
        .then(() => {
            demonstrateUseCases();
            console.log('✨ Test completed successfully!');
        })
        .catch(error => {
            console.error('💥 Test failed:', error);
            process.exit(1);
        });
}

module.exports = {
    testTemplateUpdateCapabilities,
    demonstrateUseCases
};
