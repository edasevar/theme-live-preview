import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parse, parseTree, getNodeValue } from 'jsonc-parser';

export interface ThemeDefinition {
	name?: string;
	type?: 'light' | 'dark';
	colors?: Record<string, string>;
	semanticTokenColors?: Record<string, string | { foreground?: string; fontStyle?: string }>;
	tokenColors?: Array<{
		scope?: string | string[];
		settings?: {
			foreground?: string;
			background?: string;
			fontStyle?: string;
		};
	}>;
}

export class ThemeManager {
	private context: vscode.ExtensionContext;
	private currentTheme: ThemeDefinition = {};
	private templateTheme: ThemeDefinition = {};
	private changeListeners: Array<(key: string, value: string) => void> = [];

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.loadTemplateTheme();
	}

	private loadTemplateTheme() {
		try {
			const templatePath = path.join(this.context.extensionPath, 'TEMPLATE.jsonc');
			if (fs.existsSync(templatePath)) {
				const templateContent = fs.readFileSync(templatePath, 'utf8');
				this.templateTheme = parse(templateContent);
			}
		} catch (error) {
			console.error('Failed to load template theme:', error);
		}
	}

	/**
	 * Get empty theme with #ffffff and #ffffff00 values
	 */
	getEmptyTheme(): ThemeDefinition {
		const emptyTheme: ThemeDefinition = {
			name: "Empty Theme",
			type: "light",
			colors: {},
			semanticTokenColors: {},
			tokenColors: []
		};

		// Populate with template structure but empty values
		if (this.templateTheme.colors) {
			emptyTheme.colors = {};
			Object.keys(this.templateTheme.colors).forEach(key => {
				emptyTheme.colors![key] = key.includes('Background') && key !== 'editor.background' 
					? '#ffffff00' : '#ffffff';
			});
		}

		if (this.templateTheme.semanticTokenColors) {
			emptyTheme.semanticTokenColors = {};
			Object.keys(this.templateTheme.semanticTokenColors).forEach(key => {
				emptyTheme.semanticTokenColors![key] = '#ffffff';
			});
		}

		if (this.templateTheme.tokenColors) {
			emptyTheme.tokenColors = this.templateTheme.tokenColors.map(token => ({
				scope: token.scope,
				settings: {
					foreground: '#ffffff',
					...token.settings
				}
			}));
		}

		return emptyTheme;
	}

	/**
	 * Load theme from file (supports .json, .jsonc, .vsix, .css)
	 */
	async loadThemeFromFile(filePath: string): Promise<ThemeDefinition> {
		const ext = path.extname(filePath).toLowerCase();
		
		try {
			switch (ext) {
				case '.json':
				case '.jsonc':
					return this.loadJsonTheme(filePath);
				case '.vsix':
					return this.loadVsixTheme(filePath);
				case '.css':
					return this.loadCssTheme(filePath);
				default:
					throw new Error(`Unsupported file format: ${ext}`);
			}
		} catch (error) {
			throw new Error(`Failed to load theme from ${filePath}: ${error}`);
		}
	}

	private loadJsonTheme(filePath: string): ThemeDefinition {
		const content = fs.readFileSync(filePath, 'utf8');
		const theme = parse(content);
		this.currentTheme = theme;
		return theme;
	}

	private async loadVsixTheme(filePath: string): Promise<ThemeDefinition> {
		// For now, show message that VSIX support is coming
		vscode.window.showInformationMessage(
			'VSIX theme loading is not yet implemented. Please extract the theme JSON file manually.'
		);
		throw new Error('VSIX loading not implemented yet');
	}

	private loadCssTheme(filePath: string): ThemeDefinition {
		const content = fs.readFileSync(filePath, 'utf8');
		const theme: ThemeDefinition = {
			name: path.basename(filePath, '.css'),
			type: 'dark',
			colors: {},
			semanticTokenColors: {},
			tokenColors: []
		};

		// Basic CSS parsing for common VS Code color variables
		const cssVarRegex = /--vscode-([^:]+):\s*([^;]+);/g;
		let match;
		
		while ((match = cssVarRegex.exec(content)) !== null) {
			const [, property, value] = match;
			const cleanValue = value.trim();
			
			// Map CSS variables back to theme properties
			if (cleanValue.startsWith('#')) {
				const themeKey = property.replace(/-/g, '.');
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
	getCurrentTheme(): ThemeDefinition {
		const config = vscode.workspace.getConfiguration();
		const colorCustomizations = config.get<Record<string, string>>('workbench.colorCustomizations') || {};
		const tokenColorCustomizations = config.get<any>('editor.tokenColorCustomizations') || {};

		const currentTheme: ThemeDefinition = {
			name: this.currentTheme.name || 'Current Theme',
			type: this.currentTheme.type || 'dark',
			colors: { ...this.currentTheme.colors, ...colorCustomizations },
			semanticTokenColors: { 
				...this.currentTheme.semanticTokenColors, 
				...tokenColorCustomizations.semanticTokenColors 
			},
			tokenColors: this.currentTheme.tokenColors || []
		};

		return currentTheme;
	}

	/**
	 * Apply live color change with enhanced capabilities
	 */
	async applyLiveColor(key: string, value: string): Promise<void> {
		const config = vscode.workspace.getConfiguration();
		
		// Validate color value
		if (!this.isValidColor(value)) {
			throw new Error(`Invalid color value: ${value}`);
		}
		
		try {
			if (key.startsWith('semantic_')) {
				// Handle semantic token colors
				const semanticKey = key.replace('semantic_', '');
				const currentSemanticColors = config.get<Record<string, any>>('editor.tokenColorCustomizations') || {};
				if (!currentSemanticColors.semanticTokenColors) {
					currentSemanticColors.semanticTokenColors = {};
				}
				currentSemanticColors.semanticTokenColors[semanticKey] = value;
				
				await config.update('editor.tokenColorCustomizations', currentSemanticColors, vscode.ConfigurationTarget.Global);
				
				// Update internal theme state
				if (!this.currentTheme.semanticTokenColors) {
					this.currentTheme.semanticTokenColors = {};
				}
				this.currentTheme.semanticTokenColors[semanticKey] = value;
				
			} else if (key.startsWith('token_')) {
				// Handle TextMate token colors
				await this.applyTextMateColor(key, value);
				
			} else {
				// Handle workbench colors
				const currentColors = config.get<Record<string, string>>('workbench.colorCustomizations') || {};
				currentColors[key] = value;
				
				await config.update('workbench.colorCustomizations', currentColors, vscode.ConfigurationTarget.Global);
				
				// Update internal theme state
				if (!this.currentTheme.colors) {
					this.currentTheme.colors = {};
				}
				this.currentTheme.colors[key] = value;
			}
			
			// Emit change event for any listeners
			this.emitThemeChange(key, value);
			
		} catch (error) {
			throw new Error(`Failed to apply color ${key}: ${error}`);
		}
	}

	/**
	 * Apply TextMate token color changes
	 */
	private async applyTextMateColor(key: string, value: string): Promise<void> {
		const tokenIndex = parseInt(key.replace('token_', ''));
		if (isNaN(tokenIndex)) {
			throw new Error(`Invalid token index: ${key}`);
		}

		const config = vscode.workspace.getConfiguration();
		const currentTokenColors = config.get<any>('editor.tokenColorCustomizations') || {};
		
		if (!currentTokenColors.textMateRules) {
			currentTokenColors.textMateRules = [];
		}

		// Update or create the token rule
		if (!this.currentTheme.tokenColors || !this.currentTheme.tokenColors[tokenIndex]) {
			return; // Invalid token index
		}

		const tokenRule = this.currentTheme.tokenColors[tokenIndex];
		const existingRuleIndex = currentTokenColors.textMateRules.findIndex((rule: any) => 
			JSON.stringify(rule.scope) === JSON.stringify(tokenRule.scope)
		);

		const newRule = {
			scope: tokenRule.scope,
			settings: {
				...tokenRule.settings,
				foreground: value
			}
		};

		if (existingRuleIndex >= 0) {
			currentTokenColors.textMateRules[existingRuleIndex] = newRule;
		} else {
			currentTokenColors.textMateRules.push(newRule);
		}

		await config.update('editor.tokenColorCustomizations', currentTokenColors, vscode.ConfigurationTarget.Global);
		
		// Update internal theme state
		if (this.currentTheme.tokenColors && this.currentTheme.tokenColors[tokenIndex]) {
			this.currentTheme.tokenColors[tokenIndex].settings = {
				...this.currentTheme.tokenColors[tokenIndex].settings,
				foreground: value
			};
		}
	}

	/**
	 * Export current theme to file
	 */
	async exportTheme(filePath: string): Promise<void> {
		const theme = this.getCurrentTheme();
		const themeJson = JSON.stringify(theme, null, 2);
		
		fs.writeFileSync(filePath, themeJson, 'utf8');
	}

	/**
	 * Reset theme to default (clear all customizations)
	 */
	async resetTheme(): Promise<void> {
		const config = vscode.workspace.getConfiguration();
		
		await Promise.all([
			config.update('workbench.colorCustomizations', {}, vscode.ConfigurationTarget.Global),
			config.update('editor.tokenColorCustomizations', {}, vscode.ConfigurationTarget.Global)
		]);
		
		this.currentTheme = {};
	}

	/**
	 * Get template theme for reference
	 */
	getTemplateTheme(): ThemeDefinition {
		return this.templateTheme;
	}

	/**
	 * Load a specific theme by name (from available themes)
	 */
	async loadThemeByName(themeName: string): Promise<void> {
		try {
			// Try to find the theme in VS Code's available themes
			await vscode.commands.executeCommand('workbench.action.selectTheme');
		} catch (error) {
			throw new Error(`Failed to load theme "${themeName}": ${error}`);
		}
	}

	/**
	 * Get all available color properties from template
	 */
	getAllColorProperties(): { 
		workbench: string[], 
		semantic: string[], 
		textmate: Array<{ scope: string | string[], index: number }> 
	} {
		const workbench = Object.keys(this.templateTheme.colors || {});
		const semantic = Object.keys(this.templateTheme.semanticTokenColors || {});
		const textmate = (this.templateTheme.tokenColors || []).map((token, index) => ({
			scope: token.scope || `token_${index}`,
			index
		}));

		return { workbench, semantic, textmate };
	}

	/**
	 * Validate if a color value is valid
	 */
	private isValidColor(color: string): boolean {
		if (typeof color !== 'string') return false;
		
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
		const namedColors = ['transparent', 'inherit', 'initial', 'unset'];
		if (namedColors.includes(color.toLowerCase())) {
			return true;
		}
		
		return false;
	}

	/**
	 * Emit theme change event to listeners
	 */
	private emitThemeChange(key: string, value: string): void {
		this.changeListeners.forEach(listener => {
			try {
				listener(key, value);
			} catch (error) {
				console.error('Error in theme change listener:', error);
			}
		});
	}

	/**
	 * Add a listener for theme changes
	 */
	public onThemeChange(listener: (key: string, value: string) => void): vscode.Disposable {
		this.changeListeners.push(listener);
		
		return {
			dispose: () => {
				const index = this.changeListeners.indexOf(listener);
				if (index >= 0) {
					this.changeListeners.splice(index, 1);
				}
			}
		};
	}

	/**
	 * Get live preview of color changes without applying them
	 */
	async previewColor(key: string, value: string): Promise<void> {
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
	async applyBatchColors(changes: Array<{ key: string, value: string }>): Promise<void> {
		const config = vscode.workspace.getConfiguration();
		const workbenchColors = config.get<Record<string, string>>('workbench.colorCustomizations') || {};
		const tokenCustomizations = config.get<any>('editor.tokenColorCustomizations') || {};
		
		let hasWorkbenchChanges = false;
		let hasTokenChanges = false;
		
		for (const { key, value } of changes) {
			if (!this.isValidColor(value)) {
				throw new Error(`Invalid color value for ${key}: ${value}`);
			}
			
			if (key.startsWith('semantic_')) {
				const semanticKey = key.replace('semantic_', '');
				if (!tokenCustomizations.semanticTokenColors) {
					tokenCustomizations.semanticTokenColors = {};
				}
				tokenCustomizations.semanticTokenColors[semanticKey] = value;
				hasTokenChanges = true;
				
				// Update internal state
				if (!this.currentTheme.semanticTokenColors) {
					this.currentTheme.semanticTokenColors = {};
				}
				this.currentTheme.semanticTokenColors[semanticKey] = value;
				
			} else if (!key.startsWith('token_')) {
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
		const promises: Thenable<void>[] = [];
		if (hasWorkbenchChanges) {
			promises.push(config.update('workbench.colorCustomizations', workbenchColors, vscode.ConfigurationTarget.Global));
		}
		if (hasTokenChanges) {
			promises.push(config.update('editor.tokenColorCustomizations', tokenCustomizations, vscode.ConfigurationTarget.Global));
		}
		
		await Promise.all(promises);
		
		// Emit change events
		changes.forEach(({ key, value }) => {
			this.emitThemeChange(key, value);
		});
	}
}
