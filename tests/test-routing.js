const vscode = require('vscode');

async function testRouting() {
    const config = vscode.workspace.getConfiguration();
    
    // Get current token customizations
    const tokenCustomizations = config.get('editor.tokenColorCustomizations') || {};
    const semanticCustomizations = config.get('editor.semanticTokenColorCustomizations') || {};
    
    console.log('Current token customizations:', JSON.stringify(tokenCustomizations, null, 2));
    console.log('Current semantic customizations:', JSON.stringify(semanticCustomizations, null, 2));
    
    // Check if there's a semanticTokenColors section in tokenCustomizations
    if (tokenCustomizations.semanticTokenColors) {
        console.log('FOUND ISSUE: semanticTokenColors in tokenCustomizations!');
        console.log('This needs to be moved to semanticTokenColorCustomizations.rules');
    }
    
    if (tokenCustomizations.textMateRules) {
        console.log('TextMate rules are correctly placed in tokenCustomizations.textMateRules');
    }
}

// Test the routing
testRouting().catch(console.error);
