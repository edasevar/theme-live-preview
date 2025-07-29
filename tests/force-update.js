#!/usr/bin/env node

// NUCLEAR OPTION: Force update VS Code settings - NO VS CODE API BULLSHIT
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔥 FORCE UPDATING VS CODE SETTINGS - NUCLEAR OPTION 🔥');

// Path to your VS Code settings file
const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
console.log('📁 Settings file path:', settingsPath);

// Backup the original file first
const backupPath = settingsPath + '.backup.' + Date.now();
try {
    fs.copyFileSync(settingsPath, backupPath);
    console.log('💾 Backup created at:', backupPath);
} catch (error) {
    console.error('❌ Failed to create backup:', error);
    process.exit(1);
}

try {
    // Read the current settings
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    console.log('✅ Settings file read successfully');
    
    const scope = "token.debug-token";
    const oldValue = "#f904cc";
    const newValue = "#ffffff";
    
    // Check if the token exists
    if (settingsContent.includes(`"scope": "${scope}"`)) {
        console.log(`🎯 Found ${scope} in settings`);
        
        // Replace the color value - MULTIPLE METHODS TO ENSURE IT WORKS
        let updatedContent = settingsContent;
        
        // Method 1: Direct string replacement
        updatedContent = updatedContent.replace(
            `"foreground": "${oldValue}"`,
            `"foreground": "${newValue}"`
        );
        
        // Method 2: Regex replacement (same as our working manual script)
        updatedContent = updatedContent.replace(
            new RegExp(`("scope":\\s*"${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"foreground":\\s*)"${oldValue}"`, 'g'),
            `$1"${newValue}"`
        );
        
        // Method 3: Nuclear option - replace ALL instances of the old color in the debug token section
        const debugTokenRegex = /("scope":\s*"token\.debug-token"[\s\S]*?"foreground":\s*)"#[a-fA-F0-9]{6}"/g;
        updatedContent = updatedContent.replace(debugTokenRegex, `$1"${newValue}"`);
        
        console.log('🔄 Applied multiple replacement methods');
        
        if (updatedContent !== settingsContent) {
            // Write the updated content
            fs.writeFileSync(settingsPath, updatedContent, 'utf8');
            console.log('🎉 SUCCESS! Updated settings file');
            console.log(`🎨 Changed ${scope} from ${oldValue} to ${newValue}`);
            console.log('🔄 VS Code should automatically reload the settings');
            
            // Verify the change
            const verifyContent = fs.readFileSync(settingsPath, 'utf8');
            if (verifyContent.includes(`"foreground": "${newValue}"`)) {
                console.log('✅ VERIFICATION PASSED: Change confirmed in file');
            } else {
                console.log('❌ VERIFICATION FAILED: Change not found in file');
            }
        } else {
            console.log('⚠️ No changes made - content was identical');
        }
    } else {
        console.log(`❌ ${scope} not found in settings`);
        console.log('📄 Available scopes in file:');
        const scopes = settingsContent.match(/"scope":\s*"[^"]+"/g);
        if (scopes) {
            scopes.forEach(scope => console.log('  -', scope));
        }
    }
} catch (error) {
    console.error('💥 CATASTROPHIC ERROR:', error);
    console.log('🔧 Attempting to restore backup...');
    try {
        fs.copyFileSync(backupPath, settingsPath);
        console.log('✅ Backup restored successfully');
    } catch (restoreError) {
        console.error('💀 FAILED TO RESTORE BACKUP:', restoreError);
    }
    process.exit(1);
}

console.log('🏁 Script completed');
