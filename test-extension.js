// Simple test to verify extension components load
const path = require('path');
const fs = require('fs');

console.log('Testing Theme Editor Live components...');

// Test 1: Check if compiled extension exists
const extensionPath = path.join(__dirname, 'out', 'extension.js');
if (fs.existsSync(extensionPath)) {
    console.log('✓ Extension compiled successfully');
} else {
    console.log('✗ Extension compilation failed');
    process.exit(1);
}

// Test 2: Check if TEMPLATE.jsonc exists
const templatePath = path.join(__dirname, 'TEMPLATE.jsonc');
if (fs.existsSync(templatePath)) {
    console.log('✓ TEMPLATE.jsonc found');
} else {
    console.log('✗ TEMPLATE.jsonc missing');
}

// Test 3: Check if media files exist
const mediaPath = path.join(__dirname, 'media');
if (fs.existsSync(mediaPath)) {
    const jsFile = path.join(mediaPath, 'editor-ui.js');
    const cssFile = path.join(mediaPath, 'style.css');
    
    if (fs.existsSync(jsFile) && fs.existsSync(cssFile)) {
        console.log('✓ Media files found');
    } else {
        console.log('✗ Media files missing');
    }
} else {
    console.log('✗ Media directory missing');
}

console.log('Extension components check complete.');
