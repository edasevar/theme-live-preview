// Manual test script to update VS Code settings
const fs = require('fs');
const path = require('path');
const os = require('os');

// Path to your VS Code settings file
const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');

console.log('Settings file path:', settingsPath);

try {
    // Read the current settings
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    console.log('Settings file read successfully');
    
    // First, let's just try to find and replace the specific line
    const scope = "token.debug-token";
    const oldValue = "#ffffff";
    const newValue = "#f904cc";
    
    // Check if the token exists
    if (settingsContent.includes(`"scope": "${scope}"`)) {
        console.log(`Found ${scope} in settings`);
        
        // Replace the color value
        const updatedContent = settingsContent.replace(
            new RegExp(`("scope":\\s*"${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"foreground":\\s*)"${oldValue}"`, 'g'),
            `$1"${newValue}"`
        );
        
        if (updatedContent !== settingsContent) {
            fs.writeFileSync(settingsPath, updatedContent);
            console.log(`Successfully updated ${scope} from ${oldValue} to ${newValue}!`);
            console.log('Please restart VS Code or reload the window to see changes.');
        } else {
            console.log('No changes were made - value might already be correct or pattern not found');
        }
    } else {
        console.log(`${scope} not found in settings`);
    }
    
} catch (error) {
    console.error('Error updating settings:', error);
}
