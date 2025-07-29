// Manual test script for theme routing
console.log('Starting manual routing test...');

// Simulate what happens when a TextMate token is changed
function testTextMateRouting() {
    const key = 'textmate_entity.name.type.interface';
    const value = '#ff0000';
    
    console.log(`Testing TextMate routing: ${key} -> ${value}`);
    
    if (key.startsWith("textmate_")) {
        console.log('✓ Key starts with textmate_ - routing to editor.tokenColorCustomizations.textMateRules');
        const scope = key.replace("textmate_", "");
        console.log(`  Scope: ${scope}`);
        console.log(`  This should go to textMateRules array with scope: ${scope}`);
    } else {
        console.log('✗ Key does not start with textmate_');
    }
}

// Simulate what happens when a semantic token is changed
function testSemanticRouting() {
    const key = 'semantic_class';
    const value = '#00ff00';
    
    console.log(`Testing Semantic routing: ${key} -> ${value}`);
    
    if (key.startsWith("semantic_")) {
        console.log('✓ Key starts with semantic_ - routing to editor.semanticTokenColorCustomizations.rules');
        const semanticKey = key.replace("semantic_", "");
        console.log(`  Semantic key: ${semanticKey}`);
        console.log(`  This should go to rules object with key: ${semanticKey}`);
    } else {
        console.log('✗ Key does not start with semantic_');
    }
}

testTextMateRouting();
console.log('---');
testSemanticRouting();

console.log('\nIf TextMate tokens are not routing correctly, check:');
console.log('1. Are you running the latest compiled version? (npm run compile)');
console.log('2. Is there a semanticTokenColors section in editor.tokenColorCustomizations?');
console.log('3. Is the extension handling textmate_ prefixed keys correctly?');
