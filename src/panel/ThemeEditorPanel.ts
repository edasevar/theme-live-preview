import * as vscode from 'vscode';
import * as path from 'path';
import { ThemeManager, ThemeDefinition } from '../utils/themeManager';

export class ThemeEditorPanel {
	public static currentPanel: ThemeEditorPanel | undefined;
	private readonly panel: vscode.WebviewPanel;
	private readonly extensionUri: vscode.Uri;
	private readonly themeManager: ThemeManager;
	private disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionUri: vscode.Uri, themeManager: ThemeManager) {
		const column = vscode.ViewColumn.Beside;
		
		if (ThemeEditorPanel.currentPanel) {
			ThemeEditorPanel.currentPanel.panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			'themeEditor',
			'Theme Editor Live',
			column,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(extensionUri.fsPath, 'media'))],
				retainContextWhenHidden: true
			}
		);

		ThemeEditorPanel.currentPanel = new ThemeEditorPanel(panel, extensionUri, themeManager);
	}

	private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, themeManager: ThemeManager) {
		this.panel = panel;
		this.extensionUri = extensionUri;
		this.themeManager = themeManager;

		this.update();
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

		this.panel.webview.onDidReceiveMessage(
			async (message) => {
				switch (message.type) {
					case 'liveUpdate':
						await this.handleLiveUpdate(message.key, message.value);
						break;
					case 'resetColors':
						await this.handleResetColors();
						break;
					case 'loadEmptyTheme':
						await this.handleLoadEmptyTheme();
						break;
					case 'exportTheme':
						await this.handleExportTheme();
						break;
					case 'loadTheme':
						await this.handleLoadTheme();
						break;
					case 'searchColors':
						this.handleSearchColors(message.query);
						break;
					case 'toggleSection':
						this.handleToggleSection(message.section);
						break;
				}
			},
			null,
			this.disposables
		);
	}

	private async handleLiveUpdate(key: string, value: string) {
		try {
			await this.themeManager.applyLiveColor(key, value);
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to apply color: ${error}`);
		}
	}

	private async handleResetColors() {
		try {
			await this.themeManager.resetTheme();
			this.update(); // Refresh the UI
			vscode.window.showInformationMessage('Theme colors reset to default');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to reset colors: ${error}`);
		}
	}

	private async handleLoadEmptyTheme() {
		try {
			const emptyTheme = this.themeManager.getEmptyTheme();
			// Apply empty theme colors
			for (const [key, value] of Object.entries(emptyTheme.colors || {})) {
				await this.themeManager.applyLiveColor(key, value);
			}
			for (const [key, value] of Object.entries(emptyTheme.semanticTokenColors || {})) {
				await this.themeManager.applyLiveColor(`semantic_${key}`, typeof value === 'string' ? value : value.foreground || '#ffffff');
			}
			this.update(); // Refresh the UI
			vscode.window.showInformationMessage('Empty theme loaded');
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to load empty theme: ${error}`);
		}
	}

	private async handleExportTheme() {
		vscode.commands.executeCommand('themeEditor.exportTheme');
	}

	private async handleLoadTheme() {
		vscode.commands.executeCommand('themeEditor.loadTheme');
	}

	private handleSearchColors(query: string) {
		this.panel.webview.postMessage({
			type: 'searchResults',
			query: query.toLowerCase()
		});
	}

	private handleToggleSection(section: string) {
		this.panel.webview.postMessage({
			type: 'toggleSectionResult',
			section
		});
	}

	public refresh() {
		this.update();
	}

	private update() {
		const webview = this.panel.webview;
		this.panel.webview.html = this.getHtmlForWebview(webview);
	}

	private getHtmlForWebview(webview: vscode.Webview): string {
		// Get URIs for resources
		const scriptUri = vscode.Uri.file(path.join(this.extensionUri.fsPath, 'media', 'editor-ui.js')).with({ scheme: 'vscode-resource' });
		const styleUri = vscode.Uri.file(path.join(this.extensionUri.fsPath, 'media', 'style.css')).with({ scheme: 'vscode-resource' });

		// Get current theme
		const currentTheme = this.themeManager.getCurrentTheme();
		const templateTheme = this.themeManager.getTemplateTheme();

		// Generate HTML sections
		const workbenchSection = this.generateWorkbenchColorsSection(currentTheme, templateTheme);
		const semanticSection = this.generateSemanticTokensSection(currentTheme, templateTheme);
		const textmateSection = this.generateTextMateTokensSection(currentTheme, templateTheme);

		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${styleUri}" rel="stylesheet">
			<title>Theme Editor Live</title>
		</head>
		<body>
			<div class="header">
				<h1>🎨 Theme Editor Live</h1>
				<div class="header-actions">
					<button type="button" id="loadEmptyTheme" class="btn btn-secondary">Load Empty Theme</button>
					<button type="button" id="loadTheme" class="btn btn-secondary">Load Theme File</button>
					<button type="button" id="exportTheme" class="btn btn-primary">Export Theme</button>
					<button type="button" id="resetColors" class="btn btn-danger">Reset All</button>
				</div>
			</div>

			<div class="search-bar">
				<input type="text" id="searchInput" placeholder="Search color properties..." class="search-input">
				<span class="search-count" id="searchCount"></span>
			</div>

			<div class="theme-info">
				<p><strong>Current Theme:</strong> ${currentTheme.name || 'Untitled'} (${currentTheme.type || 'dark'})</p>
			</div>

			<div class="content">
				<div class="sidebar">
					<div class="section-nav">
						<button class="nav-btn active" data-section="workbench">
							<span class="nav-icon">🖥️</span>
							Workbench UI
							<span class="nav-count">${Object.keys(currentTheme.colors || {}).length}</span>
						</button>
						<button class="nav-btn" data-section="semantic">
							<span class="nav-icon">🏷️</span>
							Semantic Tokens
							<span class="nav-count">${Object.keys(currentTheme.semanticTokenColors || {}).length}</span>
						</button>
						<button class="nav-btn" data-section="textmate">
							<span class="nav-icon">📝</span>
							TextMate Tokens
							<span class="nav-count">${(currentTheme.tokenColors || []).length}</span>
						</button>
					</div>
				</div>

				<div class="main-content">
					<div id="workbench-section" class="color-section active">
						${workbenchSection}
					</div>
					
					<div id="semantic-section" class="color-section">
						${semanticSection}
					</div>
					
					<div id="textmate-section" class="color-section">
						${textmateSection}
					</div>
				</div>
			</div>

			<div class="preview-section">
				<h3>Live Preview</h3>
				<div class="preview-container">
					<pre class="code-preview"><code class="language-typescript">
<span class="token comment">// Theme Editor Live Preview</span>
<span class="token keyword">import</span> <span class="token operator">*</span> <span class="token keyword">as</span> <span class="token namespace">vscode</span> <span class="token keyword">from</span> <span class="token string">'vscode'</span><span class="token punctuation">;</span>

<span class="token keyword">interface</span> <span class="token class-name">User</span> <span class="token punctuation">{</span>
    <span class="token property">id</span><span class="token punctuation">:</span> <span class="token builtin">number</span><span class="token punctuation">;</span>
    <span class="token property">name</span><span class="token punctuation">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
    <span class="token property">email</span><span class="token operator">?</span><span class="token punctuation">:</span> <span class="token builtin">string</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token keyword">class</span> <span class="token class-name">UserService</span> <span class="token punctuation">{</span>
    <span class="token keyword">private</span> <span class="token property">users</span><span class="token punctuation">:</span> <span class="token class-name">User</span><span class="token punctuation">[</span><span class="token punctuation">]</span> <span class="token operator">=</span> <span class="token punctuation">[</span><span class="token punctuation">]</span><span class="token punctuation">;</span>
    
    <span class="token keyword">public</span> <span class="token function">addUser</span><span class="token punctuation">(</span><span class="token parameter">user</span><span class="token punctuation">:</span> <span class="token class-name">User</span><span class="token punctuation">)</span><span class="token punctuation">:</span> <span class="token keyword">void</span> <span class="token punctuation">{</span>
        <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token property">users</span><span class="token punctuation">.</span><span class="token function">push</span><span class="token punctuation">(</span><span class="token parameter">user</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        <span class="token namespace">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token template-string"><span class="token template-punctuation">\`</span><span class="token string">Added user: </span><span class="token interpolation"><span class="token interpolation-punctuation">\${</span><span class="token parameter">user</span><span class="token punctuation">.</span><span class="token property">name</span><span class="token interpolation-punctuation">}</span></span><span class="token template-punctuation">\`</span></span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    
    <span class="token keyword">public</span> <span class="token function">getUserById</span><span class="token punctuation">(</span><span class="token parameter">id</span><span class="token punctuation">:</span> <span class="token builtin">number</span><span class="token punctuation">)</span><span class="token punctuation">:</span> <span class="token class-name">User</span> <span class="token operator">|</span> <span class="token keyword">undefined</span> <span class="token punctuation">{</span>
        <span class="token keyword">return</span> <span class="token keyword">this</span><span class="token punctuation">.</span><span class="token property">users</span><span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span><span class="token parameter">u</span> <span class="token operator">=></span> <span class="token parameter">u</span><span class="token punctuation">.</span><span class="token property">id</span> <span class="token operator">===</span> <span class="token parameter">id</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">const</span> <span class="token constant">MAGIC_NUMBER</span> <span class="token operator">=</span> <span class="token number">42</span><span class="token punctuation">;</span>
<span class="token keyword">const</span> <span class="token function-variable function">isValid</span> <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token parameter">value</span><span class="token punctuation">:</span> <span class="token builtin">any</span><span class="token punctuation">)</span> <span class="token operator">=></span> <span class="token parameter">value</span> <span class="token operator">!=</span> <span class="token keyword">null</span><span class="token punctuation">;</span>
					</code></pre>
				</div>
			</div>

			<script src="${scriptUri}"></script>
		</body>
		</html>`;
	}

	private generateWorkbenchColorsSection(currentTheme: ThemeDefinition, templateTheme: ThemeDefinition): string {
		const colors = { ...templateTheme.colors, ...currentTheme.colors };
		
		// Group colors by category
		const categories: Record<string, string[]> = {
			'Editor Core': [
				'editor.background', 'editor.foreground', 'editor.lineHighlightBackground',
				'editor.selectionBackground', 'editorCursor.foreground', 'editorWhitespace.foreground'
			],
			'Editor Widgets': [
				'editorWidget.background', 'editorWidget.border', 'editorSuggestWidget.background',
				'editorHoverWidget.background', 'editorError.foreground', 'editorWarning.foreground'
			],
			'Activity Bar': [
				'activityBar.background', 'activityBar.foreground', 'activityBar.activeBorder',
				'activityBarBadge.background', 'activityBarBadge.foreground'
			],
			'Sidebar': [
				'sideBar.background', 'sideBar.foreground', 'sideBar.border',
				'sideBarTitle.foreground', 'sideBarSectionHeader.background'
			],
			'Status Bar': [
				'statusBar.background', 'statusBar.foreground', 'statusBar.border',
				'statusBar.debuggingBackground', 'statusBarItem.hoverBackground'
			],
			'Terminal': [
				'terminal.background', 'terminal.foreground', 'terminal.ansiBlack',
				'terminal.ansiRed', 'terminal.ansiGreen', 'terminal.ansiBlue'
			],
			'Other UI Elements': []
		};

		// Add uncategorized colors
		const categorizedKeys = new Set(Object.values(categories).flat());
		Object.keys(colors).forEach(key => {
			if (!categorizedKeys.has(key)) {
				categories['Other UI Elements'].push(key);
			}
		});

		let html = '';
		for (const [categoryName, keys] of Object.entries(categories)) {
			if (keys.length === 0) continue;
			
			html += `<div class="color-category">
				<h3 class="category-title" data-category="${categoryName}">
					<span class="category-icon">▼</span>
					${categoryName}
					<span class="category-count">(${keys.length})</span>
				</h3>
				<div class="category-content">`;

			keys.forEach(key => {
				const value = colors[key] || '#ffffff';
				const safeValue = this.ensureValidHexColor(value);
				const description = this.getColorDescription(key);

				html += `<div class="color-item" data-search="${key.toLowerCase()} ${description.toLowerCase()}">
					<div class="color-info">
						<label class="color-label">${key}</label>
						<p class="color-description">${description}</p>
					</div>
					<div class="color-controls">
						<input type="color" class="color-picker" name="${key}" value="${safeValue}" title="Color picker">
						<input type="text" class="hex-input" name="${key}" value="${safeValue}" 
							   pattern="^#[0-9a-fA-F]{6,8}$" title="Hex color value">
					</div>
				</div>`;
			});

			html += `</div></div>`;
		}

		return html;
	}

	private generateSemanticTokensSection(currentTheme: ThemeDefinition, templateTheme: ThemeDefinition): string {
		const semanticColors = { ...templateTheme.semanticTokenColors, ...currentTheme.semanticTokenColors };
		
		let html = `<div class="color-category">
			<h3 class="category-title">Semantic Token Colors</h3>
			<div class="category-content">
				<p class="section-description">
					Semantic tokens provide rich syntax highlighting based on language understanding.
				</p>`;

		Object.entries(semanticColors).forEach(([key, value]) => {
			const colorValue = typeof value === 'string' ? value : (value as any)?.foreground || '#ffffff';
			const safeValue = this.ensureValidHexColor(colorValue);
			const description = this.getSemanticTokenDescription(key);

			html += `<div class="color-item" data-search="${key.toLowerCase()} ${description.toLowerCase()}">
				<div class="color-info">
					<label class="color-label">${key}</label>
					<p class="color-description">${description}</p>
				</div>
				<div class="color-controls">
					<input type="color" class="color-picker" name="semantic_${key}" value="${safeValue}">
					<input type="text" class="hex-input" name="semantic_${key}" value="${safeValue}" 
						   pattern="^#[0-9a-fA-F]{6,8}$">
				</div>
			</div>`;
		});

		html += `</div></div>`;
		return html;
	}

	private generateTextMateTokensSection(currentTheme: ThemeDefinition, templateTheme: ThemeDefinition): string {
		const tokenColors = currentTheme.tokenColors || templateTheme.tokenColors || [];
		
		let html = `<div class="color-category">
			<h3 class="category-title">TextMate Token Colors</h3>
			<div class="category-content">
				<p class="section-description">
					TextMate tokens provide detailed syntax highlighting control. 
					<em>Note: These are currently read-only in this version.</em>
				</p>`;

		tokenColors.forEach((token, index) => {
			if (!token.settings?.foreground) return;
			
			const scope = Array.isArray(token.scope) ? token.scope.join(', ') : token.scope || `token_${index}`;
			const value = token.settings.foreground;
			const safeValue = this.ensureValidHexColor(value);

			html += `<div class="color-item textmate-readonly" data-search="${scope.toLowerCase()}">
				<div class="color-info">
					<label class="color-label">${scope}</label>
					<p class="color-description">TextMate scope: ${scope}</p>
				</div>
				<div class="color-controls">
					<input type="color" class="color-picker" value="${safeValue}" disabled>
					<input type="text" class="hex-input" value="${safeValue}" disabled>
				</div>
			</div>`;
		});

		html += `</div></div>`;
		return html;
	}

	private ensureValidHexColor(color: string): string {
		if (typeof color !== 'string') return '#ffffff';
		
		// Handle transparent colors
		if (color.endsWith('00') && color.length === 9) {
			return color; // Keep transparent colors as-is
		}
		
		// Validate hex color
		if (/^#[0-9a-fA-F]{6,8}$/.test(color)) {
			return color;
		}
		
		return '#ffffff'; // Default fallback
	}

	private getColorDescription(key: string): string {
		const descriptions: Record<string, string> = {
			'editor.background': 'Main editor workspace background',
			'editor.foreground': 'Default text color for all content in the editor',
			'editor.selectionBackground': 'Background color for selected text',
			'activityBar.background': 'Background of the vertical icon bar on the far left',
			'sideBar.background': 'Background of the sidebar containing file explorer',
			'statusBar.background': 'Background of the status bar at the bottom',
			'terminal.background': 'Background of terminal panels',
			// Add more descriptions as needed
		};
		
		return descriptions[key] || 'Theme color property';
	}

	private getSemanticTokenDescription(key: string): string {
		const descriptions: Record<string, string> = {
			'class': 'Class names and definitions',
			'function': 'Function names and calls',
			'variable': 'Variable names and references',
			'keyword': 'Language keywords (if, for, return, etc.)',
			'string': 'String literals and text content',
			'comment': 'Code comments',
			'type': 'Type names and annotations',
			'property': 'Object properties and members',
			// Add more descriptions as needed
		};
		
		return descriptions[key] || 'Semantic token type';
	}

	public dispose() {
		ThemeEditorPanel.currentPanel = undefined;

		this.panel.dispose();

		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) {
				disposable.dispose();
			}
		}
	}
}
