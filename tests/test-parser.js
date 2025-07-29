const fs = require('fs');
const path = require('path');

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
        
        let totalLines = 0;
        let tokenColorsLines = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            totalLines++;
            
            // Check if we're entering the tokenColors section
            if (/"tokenColors"\s*:\s*\[/.test(line)) {
                inTokenColorsSection = true;
                console.log(`Found tokenColors section at line ${i + 1}`);
                continue;
            }
            
            // Check if we're leaving the tokenColors section (looking for closing bracket of the array)
            if (inTokenColorsSection && /^\s*\]\s*$/.test(line)) {
                inTokenColorsSection = false;
                console.log(`Left tokenColors section at line ${i + 1}`);
                break;
            }
            
            if (!inTokenColorsSection) continue;
            tokenColorsLines++;
            
            // Look for category headers like "// --- Source & Base Structure ---"
            const categoryMatch = line.match(/^\s*\/\/\s*---\s*(.+?)\s*---/);
            if (categoryMatch) {
                currentCategory = categoryMatch[1].trim();
                if (!categories[currentCategory]) {
                    categories[currentCategory] = [];
                }
                console.log(`Found category at line ${i + 1}: ${currentCategory}`);
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
                console.log(`  End of token entry for category: ${currentCategory}`);
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
                                console.log(`  Added scope: ${scope}`);
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
                        console.log(`  Added single scope: ${scope}`);
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
                        console.log(`  Added multiline scope: ${scope}`);
                    }
                }
                
                // Check if we're ending the scope array
                if (/^\s*\]/.test(line)) {
                    inScopeArray = false;
                }
            }
        }
        
        console.log('\n=== FINAL RESULTS ===');
        console.log(`Processed ${totalLines} total lines, ${tokenColorsLines} in tokenColors section`);
        console.log('Parsed TextMate token categories:', Object.keys(categories));
        console.log('\nSample categories:');
        Object.entries(categories).slice(0, 5).forEach(([k, v]) => {
            console.log(`  ${k}: [${v.slice(0, 3).join(', ')}${v.length > 3 ? ', ...' : ''}] (${v.length} tokens)`);
        });
        console.log('Total TextMate tokens:', Object.values(categories).flat().length);
        
    } catch (error) {
        console.error('Error parsing TextMate token categories:', error);
    }
    
    return categories;
}

parseTextMateCategoriesFromFile();
