const vscode = require('vscode');

async function testTextMateUpdate() {
    console.log('Testing TextMate color update...');
    
    const config = vscode.workspace.getConfiguration();
    const currentTokenColors = config.get("editor.tokenColorCustomizations") || {};
    
    console.log('Current textMateRules before update:', JSON.stringify(currentTokenColors.textMateRules || [], null, 2));
    
    if (!currentTokenColors.textMateRules) {
        currentTokenColors.textMateRules = [];
    }
    
    const scope = "token.debug-token";
    const value = "#ffffff";
    
    // Find existing rule
    let existingRuleIndex = -1;
    for (let i = 0; i < currentTokenColors.textMateRules.length; i++) {
        const rule = currentTokenColors.textMateRules[i];
        if (!rule.scope) continue;
        
        const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];
        if (ruleScopes.includes(scope)) {
            existingRuleIndex = i;
            break;
        }
    }
    
    console.log(`Found existing rule at index: ${existingRuleIndex}`);
    
    if (existingRuleIndex >= 0) {
        const existingRule = currentTokenColors.textMateRules[existingRuleIndex];
        const existingScopes = Array.isArray(existingRule.scope) ? existingRule.scope : [existingRule.scope];
        
        if (existingScopes.length === 1 && existingScopes[0] === scope) {
            currentTokenColors.textMateRules[existingRuleIndex] = {
                scope: scope,
                settings: {
                    foreground: value,
                    ...existingRule.settings
                }
            };
            console.log('Updated existing single-scope rule');
        }
    } else {
        currentTokenColors.textMateRules.push({
            scope: scope,
            settings: {
                foreground: value
            }
        });
        console.log('Added new rule');
    }
    
    console.log('textMateRules after update:', JSON.stringify(currentTokenColors.textMateRules, null, 2));
    
    try {
        await config.update("editor.tokenColorCustomizations", currentTokenColors, vscode.ConfigurationTarget.Global);
        console.log('Settings updated successfully');
    } catch (error) {
        console.error('Failed to update settings:', error);
    }
}

module.exports = { testTextMateUpdate };
