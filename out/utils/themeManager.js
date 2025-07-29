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
const jsonc_parser_1 = require("jsonc-parser");
class ThemeManager {
    constructor(context) {
        this.currentTheme = {};
        this.templateTheme = {};
        this.changeListeners = [];
        this.context = context;
        // Load TEMPLATE.jsonc for baseline keysets
        this.loadTemplateTheme();
        // Load active VS Code theme defaults
        this.loadActiveThemeDefaults();
        // Clean up any legacy settings
        this.cleanupLegacySettings();
    }
    loadTemplateTheme() {
        try {
            const templatePath = path.join(this.context.extensionPath, 'TEMPLATE.jsonc');
            if (fs.existsSync(templatePath)) {
                const content = fs.readFileSync(templatePath, 'utf8');
                this.templateTheme = (0, jsonc_parser_1.parse)(content);
            }
        }
        catch (error) {
            console.error('Failed to load TEMPLATE.jsonc:', error);
        }
    }
    /**
     * Clean up legacy settings that put semantic tokens in the wrong location
     */
    async cleanupLegacySettings() {
        try {
            const config = vscode.workspace.getConfiguration();
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
    }
    /**
      * Get empty theme with #ffffff and #ffffff00 values
      */
    getEmptyTheme() {
        const emptyTheme = {
            name: "Empty Theme",
            type: "light",
            colors: {},
            semanticTokenColors: {},
            tokenColors: [],
        };
        // Populate with template structure but empty values
        if (this.templateTheme.colors) {
            emptyTheme.colors = {};
            Object.keys(this.templateTheme.colors).forEach((key) => {
                emptyTheme.colors[key] =
                    key.includes("Background") && key !== "editor.background"
                        ? "#ffffff00"
                        : "#ffffff";
            });
        }
        if (this.templateTheme.semanticTokenColors) {
            emptyTheme.semanticTokenColors = {};
            Object.keys(this.templateTheme.semanticTokenColors).forEach((key) => {
                emptyTheme.semanticTokenColors[key] = "#ffffff";
            });
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
        }
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
    async loadVsixTheme(filePath) {
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
            const vscodeTokens = tokenColorCustomizations.textMateRules.map((rule) => ({
                scope: rule.scope,
                settings: rule.settings // Use settings object directly
            }));
            tokenColors = [...tokenColors, ...vscodeTokens];
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
        const config = vscode.workspace.getConfiguration();
        // Validate color value
        if (!this.isValidColor(value)) {
            throw new Error(`Invalid color value: ${value}`);
        }
        try {
            if (key.startsWith("semantic_")) {
                // Handle semantic token colors - go to editor.semanticTokenColorCustomizations
                const semanticKey = key.replace("semantic_", "");
                const currentSemanticColors = config.get("editor.semanticTokenColorCustomizations") || {};
                // Ensure the structure exists
                if (!currentSemanticColors.rules) {
                    currentSemanticColors.rules = {};
                }
                if (currentSemanticColors.enabled === undefined) {
                    currentSemanticColors.enabled = true;
                }
                currentSemanticColors.rules[semanticKey] = value;
                await config.update("editor.semanticTokenColorCustomizations", currentSemanticColors, vscode.ConfigurationTarget.Global);
                // Update internal theme state
                if (!this.currentTheme.semanticTokenColors) {
                    this.currentTheme.semanticTokenColors = {};
                }
                this.currentTheme.semanticTokenColors[semanticKey] = value;
            }
            else if (key.startsWith("textmate_")) {
                // Handle TextMate token colors - go to editor.tokenColorCustomizations
                const scope = key.replace("textmate_", "");
                console.log(`[ThemeManager] Routing TextMate token: ${scope} = ${value}`);
                await this.applyTextMateColor(scope, value);
            }
            else {
                // Handle workbench colors
                const currentColors = config.get("workbench.colorCustomizations") ||
                    {};
                currentColors[key] = value;
                await config.update("workbench.colorCustomizations", currentColors, vscode.ConfigurationTarget.Global);
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
     */
    async applyTextMateColor(scope, value) {
        console.log(`[ThemeManager] Applying TextMate color: ${scope} = ${value}`);
        const config = vscode.workspace.getConfiguration();
        const currentTokenColors = config.get("editor.tokenColorCustomizations") || {};
        if (!currentTokenColors.textMateRules) {
            currentTokenColors.textMateRules = [];
        }
        // Find existing rule for this scope or create new one
        const existingRuleIndex = currentTokenColors.textMateRules.findIndex((rule) => {
            const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];
            return ruleScopes.includes(scope);
        });
        const newRule = {
            scope: [scope], // Always use array format for consistency
            settings: {
                foreground: value,
            },
        };
        if (existingRuleIndex >= 0) {
            // Update existing rule
            currentTokenColors.textMateRules[existingRuleIndex] = newRule;
        }
        else {
            // Add new rule
            currentTokenColors.textMateRules.push(newRule);
        }
        await config.update("editor.tokenColorCustomizations", currentTokenColors, vscode.ConfigurationTarget.Global);
        console.log(`[ThemeManager] Updated editor.tokenColorCustomizations:`, JSON.stringify(currentTokenColors, null, 2));
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
                scope: [scope], // Use array format for consistency
                settings: { foreground: value }
            });
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
                const existingRuleIndex = tokenCustomizations.textMateRules.findIndex((rule) => {
                    const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];
                    return ruleScopes.includes(scope);
                });
                const newRule = {
                    scope: [scope], // Use array format for consistency
                    settings: { foreground: value }
                };
                if (existingRuleIndex >= 0) {
                    tokenCustomizations.textMateRules[existingRuleIndex] = newRule;
                }
                else {
                    tokenCustomizations.textMateRules.push(newRule);
                }
                hasTokenChanges = true;
                // Update internal state
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
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map