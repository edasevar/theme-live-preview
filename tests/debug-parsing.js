const fs = require('fs');
const path = require('path');

console.log('🔍 DEBUGGING TEXTMATE PARSING');
console.log('=' .repeat(50));

// Test the exact same logic as in the extension
function parseTextMateCategoriesFromFile() {
    const categories = {};
    
    try {
        const templatePath = path.join(__dirname, 'TEMPLATE.jsonc');
        const templateContent = fs.readFileSync(templatePath, 'utf8');
        const lines = templateContent.split(/\r?\n/);
        
        let currentCategory = '';
        let inTokenColorsSection = false;
        let inScopeArray = false;
        let inCurrentTokenEntry = false;
        
        console.log('📄 Total lines in template:', lines.length);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check if we're entering the tokenColors section
            if (/"tokenColors"\s*:\s*\[/.test(line)) {
                console.log('✅ Found tokenColors section at line', i + 1);
                inTokenColorsSection = true;
                continue;
            }
            
            // Check if we're leaving the tokenColors section (looking for closing bracket of the array)
            if (inTokenColorsSection && /^\s*\]\s*$/.test(line)) {
                console.log('✅ Exiting tokenColors section at line', i + 1);
                inTokenColorsSection = false;
                break;
            }
            
            if (!inTokenColorsSection) continue;
            
            // Look for category headers like "// --- Source & Base Structure ---"
            const categoryMatch = line.match(/^\s*\/\/\s*---\s*(.+?)\s*---/);
            if (categoryMatch) {
                currentCategory = categoryMatch[1].trim();
                if (!categories[currentCategory]) {
                    categories[currentCategory] = [];
                }
                console.log('📂 Found category:', currentCategory, 'at line', i + 1);
                continue;
            }
            
            // Look for token entry start
            if (/^\s*\{/.test(line)) {
                inCurrentTokenEntry = true;
                inScopeArray = false;
                continue;
            }
            
            // Look for token entry end
            if (/^\s*\}/.test(line)) {
                inCurrentTokenEntry = false;
                inScopeArray = false;
                continue;
            }
            
            // Skip if not in a token entry or no current category
            if (!inCurrentTokenEntry || !currentCategory) continue;
            
            // Look for scope arrays (both single line and multiline)
            if (/"scope"\s*:\s*\[/.test(line)) {
                inScopeArray = true;
                
                // Check if it's a single-line scope array
                const singleLineMatch = line.match(/"scope"\s*:\s*\[([^\]]+)\]/);
                if (singleLineMatch) {
                    const scopesText = singleLineMatch[1];
                    const scopeMatches = scopesText.match(/"([^"]+)"/g);
                    if (scopeMatches) {
                        scopeMatches.forEach(match => {
                            const scope = match.replace(/"/g, '');
                            if (!categories[currentCategory].includes(scope)) {
                                categories[currentCategory].push(scope);
                            }
                        });
                    }
                    inScopeArray = false;
                }
                continue;
            }
            
            // Handle single scope (not in array)
            if (!inScopeArray && /"scope"\s*:\s*"([^"]+)"/.test(line)) {
                const singleScopeMatch = line.match(/"scope"\s*:\s*"([^"]+)"/);
                if (singleScopeMatch) {
                    const scope = singleScopeMatch[1];
                    if (!categories[currentCategory].includes(scope)) {
                        categories[currentCategory].push(scope);
                    }
                }
                continue;
            }
            
            // If we're in a multiline scope array, collect the scopes
            if (inScopeArray) {
                // Look for individual scope strings
                const scopeMatch = line.match(/^\s*"([^"]+)"/);
                if (scopeMatch) {
                    const scope = scopeMatch[1];
                    if (!categories[currentCategory].includes(scope)) {
                        categories[currentCategory].push(scope);
                    }
                }
                
                // Check if we're ending the scope array
                if (/^\s*\]/.test(line)) {
                    inScopeArray = false;
                }
            }
        }
        
        console.log('\n📊 PARSING RESULTS:');
        console.log('Categories found:', Object.keys(categories).length);
        console.log('Total tokens:', Object.values(categories).flat().length);
        
        console.log('\n📋 CATEGORIES:');
        Object.keys(categories).forEach((cat, index) => {
            console.log(`${index + 1}. ${cat} (${categories[cat].length} tokens)`);
        });
        
        console.log('\n🔎 SAMPLE TOKENS:');
        const firstCategory = Object.keys(categories)[0];
        if (firstCategory) {
            console.log(`First category "${firstCategory}" contains:`, categories[firstCategory].slice(0, 3));
        }
        
    } catch (error) {
        console.error('❌ Error parsing TextMate token categories:', error);
    }
    
    return categories;
}

// Test the parsing
const result = parseTextMateCategoriesFromFile();

console.log('\n🏁 FINAL RESULT:');
console.log('Should return object with categories as keys and token arrays as values');
console.log('Result is empty?', Object.keys(result).length === 0);
