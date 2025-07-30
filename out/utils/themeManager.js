"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThemeManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const jsonc_parser_1 = require("jsonc-parser");
class ThemeManager {
    constructor(context) {
        this.currentTheme = {};
        this.templateTheme = {};
        this.changeListeners = [];
        this.logEntries = [];
        this.MAX_LOG_ENTRIES = 1000;
        this.context = context;
        this.log('info', 'ThemeManager initializing...');
        // Load TEMPLATE.jsonc for baseline keysets
        this.loadTemplateTheme();
        // Load active VS Code theme defaults
        this.loadActiveThemeDefaults();
        // Clean up any legacy settings
        this.cleanupLegacySettings();
        this.log('info', 'ThemeManager initialized successfully');
    }
    /**
     * Enhanced logging system with different levels
     */
    log(level, message, data) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            data
        };
        this.logEntries.push(entry);
        // Keep log size manageable
        if (this.logEntries.length > this.MAX_LOG_ENTRIES) {
            this.logEntries = this.logEntries.slice(-this.MAX_LOG_ENTRIES);
        }
        // Console output with appropriate level
        const logMessage = `[ThemeManager:${level.toUpperCase()}] ${message}`;
        switch (level) {
            case 'error':
                console.error(logMessage, data);
                break;
            case 'warn':
                console.warn(logMessage, data);
                break;
            case 'debug':
                console.debug(logMessage, data);
                break;
            default:
                console.log(logMessage, data);
        }
    }
    /**
     * Get recent log entries for debugging
     */
    getLogEntries(count = 50) {
        return this.logEntries.slice(-count);
    }
    /**
     * Clear log entries
     */
    clearLogs() {
        this.logEntries = [];
        this.log('info', 'Log entries cleared');
    }
    loadTemplateTheme() {
        try {
            const templatePath = path.join(this.context.extensionPath, 'TEMPLATE.jsonc');
            this.log('debug', `Loading template from: ${templatePath}`);
            if (fs.existsSync(templatePath)) {
                const content = fs.readFileSync(templatePath, 'utf8');
                this.templateTheme = (0, jsonc_parser_1.parse)(content);
                const stats = this.getTemplateStats();
                this.log('info', 'Template theme loaded successfully', stats);
            }
            else {
                this.log('warn', 'TEMPLATE.jsonc not found, using empty template');
                this.templateTheme = { colors: {}, semanticTokenColors: {}, tokenColors: [] };
            }
        }
        catch (error) {
            this.log('error', 'Failed to load TEMPLATE.jsonc', error);
            this.templateTheme = { colors: {}, semanticTokenColors: {}, tokenColors: [] };
        }
    }
    /**
     * Clean up legacy settings that put semantic tokens in the wrong location
     */
    async cleanupLegacySettings() {
        try {
            const config = vscode.workspace.getConfiguration();
            // use the proper interface and drop the stray diff marker
            const tokenCustomizations = config.get("editor.tokenColorCustomizations") || {};
            // If there's a legacy semanticTokenColors section in tokenColorCustomizations, remove it
            if (tokenCustomizations.semanticTokenColors) {
                console.log('Cleaning up legacy semanticTokenColors from editor.tokenColorCustomizations');
                // Move the semantic tokens to the correct location
                const semanticCustomizations = config.get("editor.semanticTokenColorCustomizations") || {};
                if (!semanticCustomizations.rules) {
                    semanticCustomizations.rules = {};
                }
                if (semanticCustomizations.enabled === undefined) {
                    semanticCustomizations.enabled = true;
                }
                // Merge the legacy semantic tokens
                Object.assign(semanticCustomizations.rules, tokenCustomizations.semanticTokenColors);
                // Update the correct setting
                await config.update("editor.semanticTokenColorCustomizations", semanticCustomizations, vscode.ConfigurationTarget.Global);
                // Remove the legacy section
                delete tokenCustomizations.semanticTokenColors;
                await config.update("editor.tokenColorCustomizations", tokenCustomizations, vscode.ConfigurationTarget.Global);
                console.log('Legacy semantic token settings cleaned up successfully');
            }
        }
        catch (error) {
            console.error('Failed to clean up legacy settings:', error);
        }
        // Remove deprecated entries from globalState to prevent conflicts with the new schema
        const legacyKeys = [
            'themeEditor.legacyColorMap',
            'themeEditor.oldTokenSettings'
        ];
        for (const key of legacyKeys) {
            await this.context.globalState.update(key, undefined);
        }
    }
    /**
      * Get empty theme with #ffffff and #ffffff00 values
      */
    getEmptyTheme() {
        console.log('[ThemeManager] === EMPTY THEME GENERATION START ===');
        console.log('[ThemeManager] Template theme status:', {
            colors: Object.keys(this.templateTheme.colors || {}).length,
            semanticTokenColors: Object.keys(this.templateTheme.semanticTokenColors || {}).length,
            tokenColors: (this.templateTheme.tokenColors || []).length,
            templateThemeExists: !!this.templateTheme,
            templateThemeKeys: Object.keys(this.templateTheme)
        });
        const emptyTheme = {
            name: "Empty Theme",
            type: "light",
            colors: {},
            semanticTokenColors: {},
            tokenColors: [],
        };
        // Try to load from the empty-theme.json file as fallback
        const hasTemplateData = this.templateTheme.colors && Object.keys(this.templateTheme.colors).length > 0;
        console.log('[ThemeManager] Has template data:', hasTemplateData);
        if (!hasTemplateData) {
            console.log('[ThemeManager] Template theme is empty or missing, using fallback...');
            try {
                const emptyThemePath = path.join(this.context.extensionPath, 'themes', 'empty-theme.json');
                console.log('[ThemeManager] Looking for fallback at:', emptyThemePath);
                if (fs.existsSync(emptyThemePath)) {
                    console.log('[ThemeManager] Fallback file exists, loading...');
                    const fallbackContent = fs.readFileSync(emptyThemePath, 'utf8');
                    const fallbackTheme = JSON.parse(fallbackContent);
                    console.log('[ThemeManager] Successfully loaded empty-theme.json fallback with:', {
                        colors: Object.keys(fallbackTheme.colors || {}).length,
                        semanticTokenColors: Object.keys(fallbackTheme.semanticTokenColors || {}).length,
                        tokenColors: (fallbackTheme.tokenColors || []).length
                    });
                    return fallbackTheme;
                }
                else {
                    console.log('[ThemeManager] Fallback file does not exist');
                }
            }
            catch (error) {
                console.warn('[ThemeManager] Could not load empty-theme.json fallback:', error);
            }
            // Ultimate fallback - create a basic structure manually
            console.log('[ThemeManager] Using manual fallback structure...');
            emptyTheme.colors = {
                "editor.background": "#ffffff",
                "editor.foreground": "#000000",
                "activityBar.background": "#ffffff00",
                "sideBar.background": "#ffffff00",
                "panel.background": "#ffffff00",
                "statusBar.background": "#ffffff00"
            };
            emptyTheme.semanticTokenColors = {
                "class": "#000000",
                "function": "#000000",
                "variable": "#000000",
                "keyword": "#000000",
                "comment": "#888888"
            };
            emptyTheme.tokenColors = [
                {
                    scope: ["comment"],
                    settings: { foreground: "#888888" }
                },
                {
                    scope: ["keyword"],
                    settings: { foreground: "#000000" }
                },
                {
                    scope: ["string"],
                    settings: { foreground: "#000000" }
                }
            ];
            console.log('[ThemeManager] Manual fallback complete with:', {
                colors: Object.keys(emptyTheme.colors).length,
                semanticTokenColors: Object.keys(emptyTheme.semanticTokenColors).length,
                tokenColors: emptyTheme.tokenColors.length
            });
            return emptyTheme;
        }
        // Populate with template structure but empty values
        console.log('[ThemeManager] Using template-based generation...');
        if (this.templateTheme.colors) {
            emptyTheme.colors = {};
            const transparentBackgrounds = [
                'activityBar.background',
                'sideBar.background',
                'panel.background',
                'statusBar.background'
            ];
            Object.keys(this.templateTheme.colors).forEach((key) => {
                emptyTheme.colors[key] = transparentBackgrounds.includes(key)
                    ? "#ffffff00"
                    : "#ffffff";
            });
            console.log(`[ThemeManager] Generated ${Object.keys(emptyTheme.colors).length} color entries from template`);
        }
        if (this.templateTheme.semanticTokenColors) {
            emptyTheme.semanticTokenColors = {};
            Object.keys(this.templateTheme.semanticTokenColors).forEach((key) => {
                emptyTheme.semanticTokenColors[key] = "#ffffff";
            });
            console.log(`[ThemeManager] Generated ${Object.keys(emptyTheme.semanticTokenColors).length} semantic token entries from template`);
        }
        if (this.templateTheme.tokenColors) {
            emptyTheme.tokenColors = this.templateTheme.tokenColors.map(token => ({
                scope: token.scope,
                settings: {
                    foreground: "#ffffff",
                    background: token.settings?.background,
                    fontStyle: token.settings?.fontStyle
                }
            }));
            console.log(`[ThemeManager] Generated ${emptyTheme.tokenColors.length} TextMate token entries from template`);
        }
        console.log('[ThemeManager] === EMPTY THEME GENERATION COMPLETE ===');
        return emptyTheme;
    }
    /**
     * Load theme from file (supports .json, .jsonc, .vsix, .css)
     */
    async loadThemeFromFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        try {
            switch (ext) {
                case ".json":
                case ".jsonc":
                    return this.loadJsonTheme(filePath);
                case ".vsix":
                    return this.loadVsixTheme(filePath);
                case ".css":
                    return this.loadCssTheme(filePath);
                default:
                    throw new Error(`Unsupported file format: ${ext}`);
            }
        }
        catch (error) {
            throw new Error(`Failed to load theme from ${filePath}: ${error}`);
        }
    }
    loadJsonTheme(filePath) {
        const content = fs.readFileSync(filePath, "utf8");
        const theme = (0, jsonc_parser_1.parse)(content);
        this.currentTheme = theme;
        return theme;
    }
    async loadVsixTheme(_filePath) {
        // For now, show message that VSIX support is coming
        vscode.window.showInformationMessage("VSIX theme loading is not yet implemented. Please extract the theme JSON file manually.");
        throw new Error("VSIX loading not implemented yet");
    }
    loadCssTheme(filePath) {
        const content = fs.readFileSync(filePath, "utf8");
        const theme = {
            name: path.basename(filePath, ".css"),
            type: "dark",
            colors: {},
            semanticTokenColors: {},
            tokenColors: [],
        };
        // Basic CSS parsing for common VS Code color variables
        const cssVarRegex = /--vscode-([^:]+):\s*([^;]+);/g;
        let match;
        while ((match = cssVarRegex.exec(content)) !== null) {
            const [, property, value] = match;
            const cleanValue = value.trim();
            // Map CSS variables back to theme properties
            if (cleanValue.startsWith("#")) {
                const themeKey = property.replace(/-/g, ".");
                if (theme.colors) {
                    theme.colors[themeKey] = cleanValue;
                }
            }
        }
        this.currentTheme = theme;
        return theme;
    }
    /**
     * Get current theme (merging with VS Code's current customizations)
     */
    getCurrentTheme() {
        const config = vscode.workspace.getConfiguration();
        const colorCustomizations = config.get("workbench.colorCustomizations") || {};
        const tokenColorCustomizations = config.get("editor.tokenColorCustomizations") || {};
        const semanticCustomizations = config.get("editor.semanticTokenColorCustomizations") || {};
        // Merge defaults, loaded theme, and user customizations
        const colors = {
            ...(this.templateTheme.colors || {}),
            ...(this.currentTheme.colors || {}),
            ...colorCustomizations
        };
        // Semantic tokens come from editor.semanticTokenColorCustomizations.rules
        const semantic = {
            ...(this.templateTheme.semanticTokenColors || {}),
            ...(this.currentTheme.semanticTokenColors || {}),
            ...(semanticCustomizations.rules || {})
        };
        // TextMate tokens: merge template, current theme, and VS Code settings
        let tokenColors = [];
        // Start with template tokens
        if (this.templateTheme.tokenColors) {
            tokenColors = [...this.templateTheme.tokenColors];
        }
        // Add current theme tokens
        if (this.currentTheme.tokenColors && this.currentTheme.tokenColors.length > 0) {
            tokenColors = [...this.currentTheme.tokenColors];
        }
        // Add VS Code settings textMateRules
        if (tokenColorCustomizations.textMateRules && Array.isArray(tokenColorCustomizations.textMateRules)) {
            console.log(`[ThemeManager] Loading ${tokenColorCustomizations.textMateRules.length} TextMate rules from VS Code settings`);
            const vscodeTokens = tokenColorCustomizations.textMateRules.map(rule => ({
                scope: rule.scope,
                settings: rule.settings // Use settings object directly
            }));
            // Debug specific token
            const debugToken = vscodeTokens.find(t => {
                const scopes = Array.isArray(t.scope) ? t.scope : [t.scope];
                return scopes.includes('token.debug-token');
            });
            if (debugToken) {
                console.log('[ThemeManager] Found token.debug-token in VS Code settings:', debugToken);
            }
            tokenColors = [...tokenColors, ...vscodeTokens];
        }
        else {
            console.log('[ThemeManager] No textMateRules found in editor.tokenColorCustomizations');
        }
        return {
            name: this.currentTheme.name || this.templateTheme.name || 'Current Theme',
            type: this.currentTheme.type || this.templateTheme.type,
            colors,
            semanticTokenColors: semantic,
            tokenColors
        };
    }
    /**
     * Apply live color change with enhanced capabilities
     */
    async applyLiveColor(key, value) {
        // Validate color value
        if (!this.isValidColor(value)) {
            throw new Error(`Invalid color value: ${value}`);
        }
        try {
            console.log(`[ThemeManager] NUCLEAR MODE: Updating ${key} = ${value}`);
            if (key.startsWith("semantic_")) {
                // Handle semantic token colors - NUCLEAR OPTION
                const semanticKey = key.replace("semantic_", "");
                console.log(`[ThemeManager] NUCLEAR SEMANTIC: ${semanticKey} = ${value}`);
                await this.updateSemanticTokenDirect(semanticKey, value);
                // Update internal theme state
                if (!this.currentTheme.semanticTokenColors) {
                    this.currentTheme.semanticTokenColors = {};
                }
                this.currentTheme.semanticTokenColors[semanticKey] = value;
            }
            else if (key.startsWith("textmate_")) {
                // Handle TextMate token colors - NUCLEAR OPTION
                const scope = key.replace("textmate_", "");
                console.log(`[ThemeManager] NUCLEAR TEXTMATE: ${scope} = ${value}`);
                await this.updateSettingsFileDirect(scope, value);
                // Update internal theme state
                if (!this.currentTheme.tokenColors) {
                    this.currentTheme.tokenColors = [];
                }
                const existingTokenIndex = this.currentTheme.tokenColors.findIndex(token => {
                    const tokenScopes = Array.isArray(token.scope) ? token.scope : (token.scope ? [token.scope] : []);
                    return tokenScopes.includes(scope);
                });
                if (existingTokenIndex >= 0) {
                    this.currentTheme.tokenColors[existingTokenIndex].settings = { foreground: value };
                }
                else {
                    this.currentTheme.tokenColors.push({
                        scope: scope,
                        settings: { foreground: value }
                    });
                }
            }
            else {
                // Handle workbench colors - NUCLEAR OPTION
                console.log(`[ThemeManager] NUCLEAR WORKBENCH: ${key} = ${value}`);
                await this.updateWorkbenchColorDirect(key, value);
                // Update internal theme state
                if (!this.currentTheme.colors) {
                    this.currentTheme.colors = {};
                }
                this.currentTheme.colors[key] = value;
            }
            // Emit change event for any listeners
            this.emitThemeChange(key, value);
        }
        catch (error) {
            throw new Error(`Failed to apply color ${key}: ${error}`);
        }
    }
    /**
     * Apply TextMate token color changes to editor.tokenColorCustomizations
     * This version directly updates the main VS Code settings file to ensure changes persist
     */
    async applyTextMateColor(scope, value) {
        try {
            console.log(`[ThemeManager] Applying TextMate color: ${scope} = ${value}`);
            // First, try the VS Code API approach
            const config = vscode.workspace.getConfiguration();
            // Use strongly-typed EditorTokenColorCustomizations instead of any
            const currentTokenColors = config.get("editor.tokenColorCustomizations") || {};
            console.log(`[ThemeManager] Current textMateRules:`, JSON.stringify(currentTokenColors.textMateRules || [], null, 2));
            if (!currentTokenColors.textMateRules) {
                currentTokenColors.textMateRules = [];
            }
            // Find existing rule for this scope with improved matching
            let existingRuleIndex = -1;
            for (let i = 0; i < currentTokenColors.textMateRules.length; i++) {
                const rule = currentTokenColors.textMateRules[i];
                console.log(`[ThemeManager] Checking rule ${i}:`, JSON.stringify(rule, null, 2));
                if (!rule.scope)
                    continue;
                // Handle both string and array scope formats
                const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];
                console.log(`[ThemeManager] Rule scopes:`, ruleScopes, `Looking for:`, scope);
                // Check if this rule contains our scope
                if (ruleScopes.includes(scope)) {
                    existingRuleIndex = i;
                    console.log(`[ThemeManager] Found matching rule at index ${i}`);
                    break;
                }
            }
            console.log(`[ThemeManager] Looking for scope "${scope}", found at index: ${existingRuleIndex}`);
            if (existingRuleIndex >= 0) {
                // Update existing rule - preserve the original scope format and other scopes
                const existingRule = currentTokenColors.textMateRules[existingRuleIndex];
                const existingScopes = Array.isArray(existingRule.scope)
                    ? existingRule.scope.filter((s) => s !== undefined)
                    : existingRule.scope ? [existingRule.scope] : [];
                // If this rule only contains our scope, update it directly
                if (existingScopes.length === 1 && existingScopes[0] === scope) {
                    currentTokenColors.textMateRules[existingRuleIndex] = {
                        scope: scope, // Keep as single scope, not array
                        settings: {
                            foreground: value,
                            ...existingRule.settings // Preserve other settings like fontStyle
                        }
                    };
                    console.log(`[ThemeManager] Updated existing single-scope rule for "${scope}"`);
                }
                else {
                    // Rule contains multiple scopes, need to handle differently
                    // Remove our scope from the existing rule and create a new rule for our scope
                    const otherScopes = existingScopes.filter(s => s !== scope);
                    if (otherScopes.length > 0) {
                        currentTokenColors.textMateRules[existingRuleIndex].scope = otherScopes.length === 1 ? otherScopes[0] : otherScopes;
                    }
                    else {
                        // Remove the rule entirely if it has no other scopes
                        currentTokenColors.textMateRules.splice(existingRuleIndex, 1);
                    }
                    // Add new rule for our scope
                    currentTokenColors.textMateRules.push({
                        scope: scope,
                        settings: {
                            foreground: value
                        }
                    });
                    console.log(`[ThemeManager] Separated scope "${scope}" into new rule`);
                }
            }
            else {
                // Add new rule
                currentTokenColors.textMateRules.push({
                    scope: scope,
                    settings: {
                        foreground: value
                    }
                });
                console.log(`[ThemeManager] Added new rule for scope "${scope}"`);
            }
            // NUCLEAR OPTION: Skip the broken VS Code API entirely
            console.log(`[ThemeManager] NUCLEAR OPTION: Bypassing VS Code API - going straight to direct file update`);
            // Fallback to direct file manipulation (like our manual script)
            await this.updateSettingsFileDirect(scope, value);
            // Update internal theme state
            if (!this.currentTheme.tokenColors) {
                this.currentTheme.tokenColors = [];
            }
            const existingTokenIndex = this.currentTheme.tokenColors.findIndex(token => {
                const tokenScopes = Array.isArray(token.scope) ? token.scope : (token.scope ? [token.scope] : []);
                return tokenScopes.includes(scope);
            });
            if (existingTokenIndex >= 0) {
                // update the existing token settings
                this.currentTheme.tokenColors[existingTokenIndex].settings = {
                    foreground: value
                };
            }
            else {
                // add new token
                this.currentTheme.tokenColors.push({
                    scope: scope, // Keep consistent with VS Code format
                    settings: { foreground: value }
                });
            }
            // Show a notification for success
            vscode.window.showInformationMessage(`Theme Editor: Updated ${scope} to ${value}`);
        }
        catch (err) {
            // Now err is unknown; narrow to Error if possible
            console.error(`[ThemeManager] Error applying TextMate color:`, err);
            const message = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Theme Editor: Failed to update ${scope}: ${message}`);
        }
    }
    /**
     * NUCLEAR OPTION: Direct file manipulation for semantic tokens
     * Completely bypasses VS Code's broken API
     */
    async updateSemanticTokenDirect(semanticKey, value) {
        const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
        console.log(`[ThemeManager] NUCLEAR SEMANTIC: Direct update for ${semanticKey} = ${value}`);
        try {
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            let updatedContent = settingsContent;
            // Check if semanticTokenColorCustomizations exists
            if (settingsContent.includes('"editor.semanticTokenColorCustomizations"')) {
                // Update existing semantic token
                const semanticKeyEscaped = semanticKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const semanticRegex = new RegExp(`("${semanticKeyEscaped}":\\s*)"[^"]*"`, 'g');
                if (settingsContent.includes(`"${semanticKey}"`)) {
                    // Update existing key
                    updatedContent = updatedContent.replace(semanticRegex, `$1"${value}"`);
                    console.log(`[ThemeManager] NUCLEAR SEMANTIC: Updated existing ${semanticKey} to ${value}`);
                }
                else {
                    // Add new key to existing rules
                    const rulesRegex = /"rules":\s*{([^}]*)}/;
                    const rulesMatch = settingsContent.match(rulesRegex);
                    if (rulesMatch) {
                        const existingRules = rulesMatch[1].trim();
                        const newRules = existingRules ?
                            `${existingRules},\n            "${semanticKey}": "${value}"` :
                            `"${semanticKey}": "${value}"`;
                        updatedContent = updatedContent.replace(rulesRegex, `"rules": {${newRules}}`);
                        console.log(`[ThemeManager] NUCLEAR SEMANTIC: Added new ${semanticKey} to existing rules`);
                    }
                }
            }
            else {
                // Add entire semanticTokenColorCustomizations section
                const editorConfigEnd = settingsContent.lastIndexOf('"editor.tabSize"');
                if (editorConfigEnd > -1) {
                    const insertPoint = settingsContent.indexOf(',', editorConfigEnd);
                    const newSection = `,\n    "editor.semanticTokenColorCustomizations": {\n        "enabled": true,\n        "rules": {\n            "${semanticKey}": "${value}"\n        }\n    }`;
                    updatedContent = settingsContent.slice(0, insertPoint) + newSection + settingsContent.slice(insertPoint);
                    console.log(`[ThemeManager] NUCLEAR SEMANTIC: Added new semanticTokenColorCustomizations section`);
                }
            }
            if (updatedContent !== settingsContent) {
                fs.writeFileSync(settingsPath, updatedContent, 'utf8');
                console.log(`[ThemeManager] NUCLEAR SEMANTIC SUCCESS: Updated ${semanticKey} to ${value}`);
            }
        }
        catch (error) {
            console.error(`[ThemeManager] Nuclear semantic update failed:`, error);
            throw error;
        }
    }
    /**
     * NUCLEAR OPTION: Direct file manipulation for workbench colors
     * Completely bypasses VS Code's broken API
     */
    async updateWorkbenchColorDirect(colorKey, value) {
        const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
        console.log(`[ThemeManager] NUCLEAR WORKBENCH: Direct update for ${colorKey} = ${value}`);
        try {
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            let updatedContent = settingsContent;
            // Check if workbench.colorCustomizations exists
            if (settingsContent.includes('"workbench.colorCustomizations"')) {
                // Update existing workbench color
                const colorKeyEscaped = colorKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const colorRegex = new RegExp(`("${colorKeyEscaped}":\\s*)"[^"]*"`, 'g');
                if (settingsContent.includes(`"${colorKey}"`)) {
                    // Update existing key
                    updatedContent = updatedContent.replace(colorRegex, `$1"${value}"`);
                    console.log(`[ThemeManager] NUCLEAR WORKBENCH: Updated existing ${colorKey} to ${value}`);
                }
                else {
                    // Add new key to existing workbench.colorCustomizations
                    const workbenchRegex = /"workbench\.colorCustomizations":\s*{([^}]*)}/;
                    const workbenchMatch = settingsContent.match(workbenchRegex);
                    if (workbenchMatch) {
                        const existingColors = workbenchMatch[1].trim();
                        const newColors = existingColors ?
                            `${existingColors},\n        "${colorKey}": "${value}"` :
                            `"${colorKey}": "${value}"`;
                        updatedContent = updatedContent.replace(workbenchRegex, `"workbench.colorCustomizations": {${newColors}}`);
                        console.log(`[ThemeManager] NUCLEAR WORKBENCH: Added new ${colorKey} to existing workbench colors`);
                    }
                }
            }
            else {
                // Add entire workbench.colorCustomizations section
                const lastConfigItem = settingsContent.lastIndexOf('"editor.tabSize"');
                if (lastConfigItem > -1) {
                    const insertPoint = settingsContent.indexOf(',', lastConfigItem);
                    const newSection = `,\n    "workbench.colorCustomizations": {\n        "${colorKey}": "${value}"\n    }`;
                    updatedContent = settingsContent.slice(0, insertPoint) + newSection + settingsContent.slice(insertPoint);
                    console.log(`[ThemeManager] NUCLEAR WORKBENCH: Added new workbench.colorCustomizations section`);
                }
            }
            if (updatedContent !== settingsContent) {
                fs.writeFileSync(settingsPath, updatedContent, 'utf8');
                console.log(`[ThemeManager] NUCLEAR WORKBENCH SUCCESS: Updated ${colorKey} to ${value}`);
            }
        }
        catch (error) {
            console.error(`[ThemeManager] Nuclear workbench update failed:`, error);
            throw error;
        }
    }
    /**
     * NUCLEAR OPTION: Direct file manipulation for TextMate tokens
     * This completely bypasses VS Code's broken API
     */
    async updateSettingsFileDirect(scope, value) {
        const settingsPath = path.join(os.homedir(), 'AppData', 'Roaming', 'Code', 'User', 'settings.json');
        console.log(`[ThemeManager] NUCLEAR TEXTMATE: Direct file update for ${scope} = ${value}`);
        try {
            const settingsContent = fs.readFileSync(settingsPath, 'utf8');
            console.log(`[ThemeManager] Read settings file successfully`);
            // Nuclear option: Multiple replacement methods to ENSURE it works
            let updatedContent = settingsContent;
            // Method 1: Find the current color value and replace it
            const currentColorMatch = settingsContent.match(new RegExp(`("scope":\\s*"${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"foreground":\\s*)"([^"]*)"`, 'g'));
            if (currentColorMatch) {
                const currentColor = currentColorMatch[0].match(/"foreground":\s*"([^"]*)"/)?.[1];
                if (currentColor) {
                    console.log(`[ThemeManager] Found current color: ${currentColor}, changing to: ${value}`);
                    // Replace the specific color in the specific scope
                    updatedContent = updatedContent.replace(new RegExp(`("scope":\\s*"${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"foreground":\\s*)"${currentColor}"`, 'g'), `$1"${value}"`);
                }
            }
            // Method 2: Nuclear regex replacement for this specific scope
            const debugTokenRegex = new RegExp(`("scope":\\s*"${scope.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?"foreground":\\s*)"#[a-fA-F0-9]{6,8}"`, 'g');
            updatedContent = updatedContent.replace(debugTokenRegex, `$1"${value}"`);
            if (updatedContent !== settingsContent) {
                fs.writeFileSync(settingsPath, updatedContent, 'utf8');
                console.log(`[ThemeManager] NUCLEAR TEXTMATE SUCCESS: Updated ${scope} to ${value}`);
                // Verify the change
                const verifyContent = fs.readFileSync(settingsPath, 'utf8');
                if (verifyContent.includes(`"foreground": "${value}"`)) {
                    console.log(`[ThemeManager] VERIFICATION PASSED: Change confirmed in file`);
                }
                else {
                    console.log(`[ThemeManager] VERIFICATION FAILED: Change not found in file`);
                }
            }
            else {
                console.log(`[ThemeManager] No changes made - content was identical`);
            }
        }
        catch (fileError) {
            console.error(`[ThemeManager] Nuclear textmate update failed:`, fileError);
            throw fileError;
        }
    }
    /**
     * Load a theme JSON/JSONC from disk and apply it
     */
    async applyThemeFromFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const theme = (0, jsonc_parser_1.parse)(content);
        this.currentTheme = theme;
        const config = vscode.workspace.getConfiguration();
        if (theme.colors) {
            await config.update('workbench.colorCustomizations', theme.colors, vscode.ConfigurationTarget.Global);
        }
        if (theme.semanticTokenColors) {
            await config.update('editor.semanticTokenColorCustomizations', { enabled: true, rules: theme.semanticTokenColors }, vscode.ConfigurationTarget.Global);
        }
        if (theme.tokenColors) {
            await config.update('editor.tokenColorCustomizations', { textMateRules: theme.tokenColors }, vscode.ConfigurationTarget.Global);
        }
    }
    /**
     * Export current theme to file
     */
    async exportTheme(filePath) {
        const theme = this.getCurrentTheme();
        const themeJson = JSON.stringify(theme, null, 2);
        fs.writeFileSync(filePath, themeJson, 'utf8');
    }
    /**
     * Reset theme to default (clear all customizations)
     */
    async resetTheme() {
        const config = vscode.workspace.getConfiguration();
        await Promise.all([
            config.update("workbench.colorCustomizations", {}, vscode.ConfigurationTarget.Global),
            config.update("editor.tokenColorCustomizations", {}, vscode.ConfigurationTarget.Global),
            config.update("editor.semanticTokenColorCustomizations", {}, vscode.ConfigurationTarget.Global),
        ]);
        this.currentTheme = {};
    }
    /**
     * Get template theme for reference
     */
    getTemplateTheme() {
        return this.templateTheme;
    }
    /**
     * Load a specific theme by name (from available themes)
     */
    async loadThemeByName(themeName) {
        try {
            // Try to find the theme in VS Code's available themes
            await vscode.commands.executeCommand("workbench.action.selectTheme");
        }
        catch (error) {
            throw new Error(`Failed to load theme "${themeName}": ${error}`);
        }
    }
    /**
     * Get all available color properties from template
     */
    getAllColorProperties() {
        const workbench = Object.keys(this.templateTheme.colors || {});
        const semantic = Object.keys(this.templateTheme.semanticTokenColors || {});
        const textmate = (this.templateTheme.tokenColors || []).map((token, index) => ({
            scope: token.scope || `token_${index}`,
            settings: Object.entries(token.settings || {}).map(([key, value]) => `${key}: ${value}`), // Convert settings to string[]
        }));
        return { workbench, semantic, textmate };
    }
    /**
     * Validate if a color value is valid
     */
    isValidColor(color) {
        if (typeof color !== "string")
            return false;
        // Check for hex colors (with or without alpha)
        if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
            return true;
        }
        // Check for rgb/rgba colors
        if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
            return true;
        }
        // Check for hsl/hsla colors
        if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
            return true;
        }
        // Check for named colors (basic validation)
        const namedColors = ["transparent", "inherit", "initial", "unset"];
        if (namedColors.includes(color.toLowerCase())) {
            return true;
        }
        return false;
    }
    /**
     * Add a listener for theme changes
     */
    onThemeChange(listener) {
        const wrappedListener = (key, value) => listener(key, value);
        this.changeListeners.push(wrappedListener);
        return {
            dispose: () => {
                const index = this.changeListeners.indexOf(wrappedListener);
                if (index !== -1) {
                    this.changeListeners.splice(index, 1);
                }
            }
        };
    }
    emitThemeChange(key, value) {
        this.changeListeners.forEach(listener => listener(key, value));
    }
    /**
     * Get live preview of color changes without applying them
     */
    async previewColor(key, value) {
        // For now, just validate the color
        if (!this.isValidColor(value)) {
            throw new Error(`Invalid color value: ${value}`);
        }
        // Future: Could implement temporary preview without persisting
        // This would be useful for hover previews or temporary changes
    }
    /**
     * Batch apply multiple color changes for better performance
     */
    async applyBatchColors(changes) {
        const config = vscode.workspace.getConfiguration();
        const workbenchColors = config.get("workbench.colorCustomizations") || {};
        const tokenCustomizations = config.get("editor.tokenColorCustomizations") || {};
        const semanticCustomizations = config.get("editor.semanticTokenColorCustomizations") || {};
        let hasWorkbenchChanges = false;
        let hasTokenChanges = false;
        let hasSemanticChanges = false;
        // Ensure semantic token structure exists
        if (!semanticCustomizations.rules) {
            semanticCustomizations.rules = {};
        }
        if (semanticCustomizations.enabled === undefined) {
            semanticCustomizations.enabled = true;
        }
        // Ensure token color structure exists
        if (!tokenCustomizations.textMateRules) {
            tokenCustomizations.textMateRules = [];
        }
        for (const { key, value } of changes) {
            if (!this.isValidColor(value)) {
                throw new Error(`Invalid color value for ${key}: ${value}`);
            }
            if (key.startsWith("semantic_")) {
                // Semantic tokens go to editor.semanticTokenColorCustomizations
                const semanticKey = key.replace("semantic_", "");
                semanticCustomizations.rules[semanticKey] = value;
                hasSemanticChanges = true;
                // Update internal state
                if (!this.currentTheme.semanticTokenColors) {
                    this.currentTheme.semanticTokenColors = {};
                }
                this.currentTheme.semanticTokenColors[semanticKey] = value;
            }
            else if (key.startsWith("textmate_")) {
                // TextMate tokens go to editor.tokenColorCustomizations
                const scope = key.replace("textmate_", "");
                // Find existing rule or create new one
                const existingRule = tokenCustomizations.textMateRules.find((rule) => {
                    const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];
                    return ruleScopes.includes(scope);
                });
                if (existingRule) {
                    existingRule.settings = { foreground: value };
                }
                else {
                    tokenCustomizations.textMateRules.push({
                        scope: [scope], // Use array format for consistency
                        settings: {
                            foreground: value
                        }
                    });
                }
                hasTokenChanges = true;
                // Update internal theme state
                // ensure array exists
                if (!this.currentTheme.tokenColors) {
                    this.currentTheme.tokenColors = [];
                }
                const existingTokenIndex = this.currentTheme.tokenColors.findIndex(token => {
                    const tokenScopes = Array.isArray(token.scope) ? token.scope : (token.scope ? [token.scope] : []);
                    return tokenScopes.includes(scope);
                });
                if (existingTokenIndex >= 0) {
                    // update existing token
                    this.currentTheme.tokenColors[existingTokenIndex].settings = {
                        foreground: value
                    };
                }
                else {
                    this.currentTheme.tokenColors.push({
                        scope: [scope], // Use array format for consistency
                        settings: { foreground: value }
                    });
                }
            }
            else {
                // Workbench colors
                workbenchColors[key] = value;
                hasWorkbenchChanges = true;
                // Update internal state
                if (!this.currentTheme.colors) {
                    this.currentTheme.colors = {};
                }
                this.currentTheme.colors[key] = value;
            }
        }
        // Apply changes in batch
        const promises = [];
        if (hasWorkbenchChanges) {
            promises.push(config.update("workbench.colorCustomizations", workbenchColors, vscode.ConfigurationTarget.Global));
        }
        if (hasSemanticChanges) {
            promises.push(config.update("editor.semanticTokenColorCustomizations", semanticCustomizations, vscode.ConfigurationTarget.Global));
        }
        if (hasTokenChanges) {
            promises.push(config.update("editor.tokenColorCustomizations", tokenCustomizations, vscode.ConfigurationTarget.Global));
        }
        await Promise.all(promises);
        // Emit change events
        changes.forEach(({ key, value }) => {
            this.emitThemeChange(key, value);
        });
    }
    /**
     * Return the raw TEMPLATE.jsonc defaults
     */
    getDefaultTheme() {
        return this.templateTheme;
    }
    /**
     * Load active VS Code theme default values
     */
    loadActiveThemeDefaults() {
        try {
            const config = vscode.workspace.getConfiguration();
            const themeName = config.get('workbench.colorTheme') || '';
            for (const ext of vscode.extensions.all) {
                const contributes = ext.packageJSON?.contributes;
                if (contributes && Array.isArray(contributes.themes)) {
                    for (const theme of contributes.themes) {
                        if (theme.label === themeName || theme.id === themeName) {
                            const themePath = path.join(ext.extensionPath, theme.path);
                            if (fs.existsSync(themePath)) {
                                const content = fs.readFileSync(themePath, 'utf8');
                                this.currentTheme = (0, jsonc_parser_1.parse)(content);
                                return;
                            }
                        }
                    }
                }
            }
            console.warn(`Active theme "${themeName}" not found in extensions`);
        }
        catch (error) {
            console.error('Failed to load active theme defaults:', error);
        }
    }
    /**
     * Reload template from TEMPLATE.jsonc file
     * This allows updating template elements after changes to the template file
     */
    async reloadTemplate() {
        this.log('info', 'Reloading template from TEMPLATE.jsonc...');
        try {
            const templatePath = path.join(this.context.extensionPath, 'TEMPLATE.jsonc');
            if (fs.existsSync(templatePath)) {
                const content = fs.readFileSync(templatePath, 'utf8');
                const oldTemplate = { ...this.templateTheme };
                this.templateTheme = (0, jsonc_parser_1.parse)(content);
                // Emit event for template change if needed
                this.emitTemplateReloaded(oldTemplate, this.templateTheme);
                const stats = this.getTemplateStats();
                this.log('info', 'Template reloaded successfully', stats);
                vscode.window.showInformationMessage(`Template reloaded: ${stats.total} elements (${stats.colors} colors, ${stats.semanticTokenColors} semantic, ${stats.tokenColors} tokens)`);
            }
            else {
                const error = 'TEMPLATE.jsonc not found';
                this.log('error', error, { path: templatePath });
                vscode.window.showErrorMessage(`Template reload failed: ${error}`);
                throw new Error(error);
            }
        }
        catch (error) {
            const message = `Failed to reload template: ${error}`;
            this.log('error', message, error);
            vscode.window.showErrorMessage(message);
            throw error;
        }
    }
    /**
     * Update a specific template element and optionally apply to current theme
     */
    async updateTemplateElement(category, key, value, applyImmediately = false) {
        this.log('debug', `Updating template element: ${category}.${key}`, { value, applyImmediately });
        try {
            // Validate inputs
            if (!category || !key) {
                throw new Error('Category and key are required');
            }
            if (!['colors', 'semanticTokenColors', 'tokenColors'].includes(category)) {
                throw new Error(`Invalid category: ${category}. Must be one of: colors, semanticTokenColors, tokenColors`);
            }
            // Update template in memory
            switch (category) {
                case 'colors':
                    if (!this.templateTheme.colors) {
                        this.templateTheme.colors = {};
                    }
                    if (typeof value !== 'string' || !this.isValidColor(value)) {
                        throw new Error(`Invalid color value for colors.${key}: ${value}`);
                    }
                    this.templateTheme.colors[key] = value;
                    break;
                case 'semanticTokenColors':
                    if (!this.templateTheme.semanticTokenColors) {
                        this.templateTheme.semanticTokenColors = {};
                    }
                    if (typeof value !== 'string' || !this.isValidColor(value)) {
                        throw new Error(`Invalid color value for semanticTokenColors.${key}: ${value}`);
                    }
                    this.templateTheme.semanticTokenColors[key] = value;
                    break;
                case 'tokenColors':
                    if (!this.templateTheme.tokenColors) {
                        this.templateTheme.tokenColors = [];
                    }
                    // Validate token color settings
                    if (typeof value === 'object' && value.foreground && !this.isValidColor(value.foreground)) {
                        throw new Error(`Invalid color value for tokenColors.${key}.foreground: ${value.foreground}`);
                    }
                    const existingIndex = this.templateTheme.tokenColors.findIndex(token => {
                        const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
                        return scopes.includes(key);
                    });
                    if (existingIndex >= 0) {
                        // Check if value is a string and convert it to the proper settings object
                        if (typeof value === 'string') {
                            this.templateTheme.tokenColors[existingIndex].settings = { foreground: value };
                        }
                        else {
                            this.templateTheme.tokenColors[existingIndex].settings = value;
                        }
                    }
                    else {
                        this.templateTheme.tokenColors.push({
                            scope: key,
                            settings: typeof value === 'string' ? { foreground: value } : value
                        });
                    }
                    break;
            }
            // Optionally apply to current theme immediately
            if (applyImmediately) {
                this.log('debug', `Applying template element immediately: ${category}.${key}`);
                switch (category) {
                    case 'colors':
                        if (typeof value === 'string') {
                            await this.applyLiveColor(key, value);
                        }
                        break;
                    case 'semanticTokenColors':
                        if (typeof value === 'string') {
                            await this.applyLiveColor(`semantic_${key}`, value);
                        }
                        else if (value.foreground) {
                            await this.applyLiveColor(`semantic_${key}`, value.foreground);
                        }
                        break;
                    case 'tokenColors':
                        const colorValue = typeof value === 'object' ? value.foreground : value;
                        if (colorValue) {
                            await this.applyLiveColor(`textmate_${key}`, colorValue);
                        }
                        break;
                }
            }
            this.log('info', `Template element updated: ${category}.${key}`, { value });
            // Show success message
            vscode.window.showInformationMessage(`Template updated: ${category}.${key} = ${typeof value === 'object' ? JSON.stringify(value) : value}`);
        }
        catch (error) {
            const message = `Failed to update template element ${category}.${key}: ${error}`;
            this.log('error', message, { category, key, value, error });
            vscode.window.showErrorMessage(message);
            throw error;
        }
    }
    /**
     * Sync template changes with current UI
     * This method ensures the UI reflects any template updates
     */
    syncTemplateWithUI() {
        this.log('info', 'Syncing template changes with UI...');
        try {
            // Emit template sync event for UI components to refresh
            this.emitTemplateSynced();
            const stats = this.getTemplateStats();
            this.log('info', 'Template synced with UI', stats);
            vscode.window.showInformationMessage(`Template synchronized: ${stats.total} elements refreshed in UI`);
        }
        catch (error) {
            const message = `Failed to sync template with UI: ${error}`;
            this.log('error', message, error);
            vscode.window.showErrorMessage(message);
            throw error;
        }
    }
    /**
     * Get template element categories and their counts
     */
    getTemplateStats() {
        const stats = {
            colors: Object.keys(this.templateTheme.colors || {}).length,
            semanticTokenColors: Object.keys(this.templateTheme.semanticTokenColors || {}).length,
            tokenColors: (this.templateTheme.tokenColors || []).length,
            total: 0
        };
        stats.total = stats.colors + stats.semanticTokenColors + stats.tokenColors;
        this.log('debug', 'Template stats calculated', stats);
        return stats;
    }
    /**
     * Emit template reloaded event
     */
    emitTemplateReloaded(oldTemplate, newTemplate) {
        const oldCount = this.getTemplateElementCount(oldTemplate);
        const newCount = this.getTemplateElementCount(newTemplate);
        this.log('debug', 'Template reloaded event', { oldCount, newCount });
        // Template change listeners could be added here for UI updates
        // For now, just emit regular theme change events to refresh UI
        this.emitTemplateSynced();
    }
    /**
     * Emit template synced event
     */
    emitTemplateSynced() {
        this.log('debug', 'Emitting template sync events...');
        // Emit change events for all template elements to refresh UI
        const template = this.templateTheme;
        let eventCount = 0;
        // Emit workbench color changes
        if (template.colors) {
            Object.entries(template.colors).forEach(([key, value]) => {
                this.emitThemeChange(key, value);
                eventCount++;
            });
        }
        // Emit semantic token changes
        if (template.semanticTokenColors) {
            Object.entries(template.semanticTokenColors).forEach(([key, value]) => {
                const color = typeof value === 'string' ? value : value.foreground || '#ffffff';
                this.emitThemeChange(`semantic_${key}`, color);
                eventCount++;
            });
        }
        // Emit TextMate token changes
        if (template.tokenColors) {
            template.tokenColors.forEach((token, _index) => {
                if (token.scope && token.settings?.foreground) {
                    const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
                    scopes.forEach(scope => {
                        this.emitThemeChange(`textmate_${scope}`, token.settings.foreground);
                        eventCount++;
                    });
                }
            });
        }
        this.log('debug', `Template sync events emitted: ${eventCount}`);
    }
    /**
     * Get total count of template elements
     */
    getTemplateElementCount(template) {
        return Object.keys(template.colors || {}).length
            + Object.keys(template.semanticTokenColors || {}).length
            + (template.tokenColors || []).length;
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map