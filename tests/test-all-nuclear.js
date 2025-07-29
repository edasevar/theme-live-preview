const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🚀 TESTING ALL NUCLEAR OPTIONS FOR THEME EDITOR LIVE');
console.log('=' .repeat(60));

const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
console.log(`Settings file: ${settingsPath}`);

try {
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    console.log('\n📋 CURRENT STATE ANALYSIS:');
    
    // Check semantic tokens
    if (settingsContent.includes('"editor.semanticTokenColorCustomizations"')) {
        console.log('✅ Semantic token customizations exist');
        if (settingsContent.includes('"class"')) {
            const classMatch = settingsContent.match(/"class":\s*"([^"]*)"/) || [];
            console.log(`   - class token: ${classMatch[1] || 'not found'}`);
        }
    } else {
        console.log('❌ No semantic token customizations found');
    }
    
    // Check TextMate tokens
    if (settingsContent.includes('"editor.tokenColorCustomizations"')) {
        console.log('✅ TextMate token customizations exist');
        if (settingsContent.includes('token.debug-token')) {
            const debugMatch = settingsContent.match(/"scope":\s*"token\.debug-token"[\s\S]*?"foreground":\s*"([^"]*)"/) || [];
            console.log(`   - token.debug-token: ${debugMatch[1] || 'not found'}`);
        }
    } else {
        console.log('❌ No TextMate token customizations found');
    }
    
    // Check workbench colors
    if (settingsContent.includes('"workbench.colorCustomizations"')) {
        console.log('✅ Workbench color customizations exist');
        if (settingsContent.includes('editor.background')) {
            const bgMatch = settingsContent.match(/"editor\.background":\s*"([^"]*)"/) || [];
            console.log(`   - editor.background: ${bgMatch[1] || 'not found'}`);
        }
    } else {
        console.log('❌ No workbench color customizations found');
    }
    
    console.log('\n🎯 YOUR EXTENSION NOW HAS NUCLEAR OPTIONS FOR:');
    console.log('1. 🔴 Semantic tokens (semantic_*) - Direct file manipulation');
    console.log('2. 🔵 TextMate tokens (textmate_*) - Direct file manipulation');  
    console.log('3. 🟢 Workbench colors (*) - Direct file manipulation');
    console.log('\n💡 ALL elements will bypass VS Code API and update settings directly!');
    
    console.log('\n🧪 TO TEST:');
    console.log('1. Press F5 to launch Extension Development Host');
    console.log('2. Run command: "Theme Editor Live: Test All Nuclear"');
    console.log('3. Watch your settings file update immediately!');
    
} catch (error) {
    console.error('❌ Error reading settings:', error);
}
