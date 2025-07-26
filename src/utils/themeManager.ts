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
	 * Apply live color change
	 */
	async applyLiveColor(key: string, value: string): Promise<void> {
		const config = vscode.workspace.getConfiguration();
		
		if (key.startsWith('semantic_')) {
			// Handle semantic token colors
			const semanticKey = key.replace('semantic_', '');
			const currentSemanticColors = config.get<Record<string, any>>('editor.tokenColorCustomizations') || {};
			if (!currentSemanticColors.semanticTokenColors) {
				currentSemanticColors.semanticTokenColors = {};
			}
			currentSemanticColors.semanticTokenColors[semanticKey] = value;
			
			await config.update('editor.tokenColorCustomizations', currentSemanticColors, vscode.ConfigurationTarget.Global);
		} else if (key.startsWith('token_')) {
			// Handle TextMate token colors (for future implementation)
			// For now, we'll just show a message
			vscode.window.showInformationMessage('TextMate token editing coming soon!');
		} else {
			// Handle workbench colors
			const currentColors = config.get<Record<string, string>>('workbench.colorCustomizations') || {};
			currentColors[key] = value;
			
			await config.update('workbench.colorCustomizations', currentColors, vscode.ConfigurationTarget.Global);
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
}
