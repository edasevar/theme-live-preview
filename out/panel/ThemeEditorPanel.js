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
exports.ThemeEditorPanel = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class ThemeEditorPanel {
    static createOrShow(extensionUri, themeManager) {
        const column = vscode.ViewColumn.Beside;
        if (ThemeEditorPanel.currentPanel) {
            ThemeEditorPanel.currentPanel.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('themeEditor', 'Theme Editor Live', column, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(extensionUri.fsPath, 'media'))],
            retainContextWhenHidden: true
        });
        ThemeEditorPanel.currentPanel = new ThemeEditorPanel(panel, extensionUri, themeManager);
    }
    constructor(panel, extensionUri, themeManager) {
        this.disposables = [];
        this.updateThrottle = null;
        this.pendingUpdates = new Map();
        this.isUpdating = false;
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.themeManager = themeManager;
        this.update();
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        // Listen for theme changes
        const themeChangeListener = this.themeManager.onThemeChange((key, value) => {
            this.sendMessageToWebview({
                type: 'themeChanged',
                key,
                value
            });
        });
        this.disposables.push(themeChangeListener);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'liveUpdate':
                    await this.handleLiveUpdate(message.key, message.value);
                    break;
                case 'batchUpdate':
                    await this.handleBatchUpdate(message.changes);
                    break;
                case 'previewColor':
                    await this.handlePreviewColor(message.key, message.value);
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
        }, null, this.disposables);
    }
    async handleLiveUpdate(key, value) {
        try {
            // Use throttling for better performance
            this.pendingUpdates.set(key, value);
            if (this.updateThrottle) {
                clearTimeout(this.updateThrottle);
            }
            this.updateThrottle = setTimeout(async () => {
                await this.flushPendingUpdates();
            }, 100); // 100ms throttle
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to apply color: ${errorMessage}`);
        }
    }
    async flushPendingUpdates() {
        if (this.isUpdating || this.pendingUpdates.size === 0) {
            return;
        }
        this.isUpdating = true;
        try {
            const changes = [];
            for (const [key, value] of this.pendingUpdates) {
                changes.push({ key, value });
            }
            this.pendingUpdates.clear();
            if (changes.length === 1) {
                // Single update
                await this.themeManager.applyLiveColor(changes[0].key, changes[0].value);
            }
            else {
                // Batch update for better performance
                await this.themeManager.applyBatchColors(changes);
            }
            // Send success feedback
            this.sendMessageToWebview({
                type: 'updateSuccess',
                changes: changes.map(c => c.key)
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to apply colors: ${errorMessage}`);
            this.sendMessageToWebview({
                type: 'updateError',
                error: errorMessage
            });
        }
        finally {
            this.isUpdating = false;
        }
    }
    async handleBatchUpdate(changes) {
        try {
            await this.themeManager.applyBatchColors(changes);
            this.sendMessageToWebview({
                type: 'batchUpdateSuccess',
                changes: changes.map(c => c.key)
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to apply batch colors: ${errorMessage}`);
            this.sendMessageToWebview({
                type: 'batchUpdateError',
                error: errorMessage
            });
        }
    }
    async handlePreviewColor(key, value) {
        try {
            await this.themeManager.previewColor(key, value);
            this.sendMessageToWebview({
                type: 'previewSuccess',
                key,
                value
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.sendMessageToWebview({
                type: 'previewError',
                key,
                error: errorMessage
            });
        }
    }
    sendMessageToWebview(message) {
        this.panel.webview.postMessage(message);
    }
    async handleResetColors() {
        try {
            await this.themeManager.resetTheme();
            this.update(); // Refresh the UI
            vscode.window.showInformationMessage('Theme colors reset to default');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to reset colors: ${error}`);
        }
    }
    async handleLoadEmptyTheme() {
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
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load empty theme: ${error}`);
        }
    }
    async handleExportTheme() {
        vscode.commands.executeCommand('themeEditor.exportTheme');
    }
    async handleLoadTheme() {
        vscode.commands.executeCommand('themeEditor.loadTheme');
    }
    handleSearchColors(query) {
        this.panel.webview.postMessage({
            type: 'searchResults',
            query: query.toLowerCase()
        });
    }
    handleToggleSection(section) {
        this.panel.webview.postMessage({
            type: 'toggleSectionResult',
            section
        });
    }
    refresh() {
        this.update();
    }
    update() {
        const webview = this.panel.webview;
        this.panel.webview.html = this.getHtmlForWebview(webview);
    }
    getHtmlForWebview(webview) {
        // Get URIs for resources
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'editor-ui.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'style.css'));
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
    generateWorkbenchColorsSection(currentTheme, templateTheme) {
        const colors = { ...templateTheme.colors, ...currentTheme.colors };
        // Group colors by category
        const categories = {
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
            if (keys.length === 0)
                continue;
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
    generateSemanticTokensSection(currentTheme, templateTheme) {
        const semanticColors = { ...templateTheme.semanticTokenColors, ...currentTheme.semanticTokenColors };
        let html = `<div class="color-category">
			<h3 class="category-title">Semantic Token Colors</h3>
			<div class="category-content">
				<p class="section-description">
					Semantic tokens provide rich syntax highlighting based on language understanding.
				</p>`;
        Object.entries(semanticColors).forEach(([key, value]) => {
            const colorValue = typeof value === 'string' ? value : value?.foreground || '#ffffff';
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
    generateTextMateTokensSection(currentTheme, templateTheme) {
        const tokenColors = currentTheme.tokenColors || templateTheme.tokenColors || [];
        let html = `<div class="color-category">
			<h3 class="category-title">TextMate Token Colors</h3>
			<div class="category-content">
				<p class="section-description">
					TextMate tokens provide detailed syntax highlighting control. 
					<em>Note: These are currently read-only in this version.</em>
				</p>`;
        tokenColors.forEach((token, index) => {
            if (!token.settings?.foreground)
                return;
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
    ensureValidHexColor(color) {
        if (typeof color !== 'string')
            return '#ffffff';
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
    getColorDescription(key) {
        const descriptions = {
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
    getSemanticTokenDescription(key) {
        const descriptions = {
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
    dispose() {
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
exports.ThemeEditorPanel = ThemeEditorPanel;
//# sourceMappingURL=ThemeEditorPanel.js.map