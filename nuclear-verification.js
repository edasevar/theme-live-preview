const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🎯 NUCLEAR OPTION VERIFICATION SCRIPT');
console.log('=' .repeat(50));

const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');

function getSettingsSnapshot() {
    try {
        const content = fs.readFileSync(settingsPath, 'utf8');
        
        // Extract current values
        const semanticClassMatch = content.match(/"class":\s*"([^"]*)"/) || [];
        const textMateDebugMatch = content.match(/"scope":\s*"token\.debug-token"[\s\S]*?"foreground":\s*"([^"]*)"/) || [];
        const workbenchBgMatch = content.match(/"editor\.background":\s*"([^"]*)"/) || [];
        
        return {
            semantic_class: semanticClassMatch[1] || 'not found',
            textmate_debug: textMateDebugMatch[1] || 'not found', 
            workbench_bg: workbenchBgMatch[1] || 'not found'
        };
    } catch (error) {
        return { error: error.message };
    }
}

console.log('📸 BEFORE NUCLEAR TEST - Current Values:');
const before = getSettingsSnapshot();
console.log(`🔴 semantic_class: ${before.semantic_class}`);
console.log(`🔵 textmate_debug-token: ${before.textmate_debug}`);
console.log(`🟢 workbench_bg: ${before.workbench_bg}`);

console.log('\n🚀 EXPECTED AFTER NUCLEAR TEST:');
console.log('🔴 semantic_class: #ff0000 (bright red)');
console.log('🔵 textmate_debug-token: #0000ff (bright blue)');
console.log('🟢 workbench_bg: #001100 (dark green)');

console.log('\n💥 NUCLEAR POWER ACTIVATED!');
console.log('Your extension will now:');
console.log('✨ Skip VS Code API entirely');
console.log('✨ Write directly to settings.json');
console.log('✨ Update ALL element types guaranteed');
console.log('✨ Show success notifications for each update');

console.log('\n🧪 TO RUN THE TEST:');
console.log('1. Press F5 to launch Extension Development Host');
console.log('2. Open Command Palette (Ctrl+Shift+P)'); 
console.log('3. Run: "Theme Editor Live: Test All Nuclear"');
console.log('4. Watch your VS Code theme change immediately!');

console.log('\n🔍 TO VERIFY:');
console.log('- Check VS Code UI changes immediately');
console.log('- Run this script again to see the new values');
console.log('- All three elements should have the new colors');
