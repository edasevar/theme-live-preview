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
const fs = __importStar(require("fs"));
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
        // Maps loaded from TEMPLATE.jsonc
        this.colorDescriptions = {};
        this.semanticDescriptions = {};
        // Map of dynamic TextMate token descriptions
        this.textmateDescriptions = {};
        this.disposables = [];
        this.updateThrottle = null;
        this.pendingUpdates = new Map();
        this.isUpdating = false;
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.themeManager = themeManager;
        // Load workbench UI color descriptions from TEMPLATE.jsonc comments
        try {
            const templatePath = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
            const lines = fs.readFileSync(templatePath, 'utf8').split(/\r?\n/);
            let inColors = false;
            for (const line of lines) {
                if (/"colors"\s*:\s*\{/.test(line)) {
                    inColors = true;
                    continue;
                }
                if (inColors) {
                    if (/^\s*\}/.test(line)) {
                        break;
                    }
                    const m = line.match(/"([^"]+)":\s*"#[0-9A-Fa-f]{6,8}"\s*,?\s*\/\/\s*(.+)/);
                    if (m) {
                        this.colorDescriptions[m[1]] = m[2].trim();
                    }
                }
            }
        }
        catch (e) {
            // Ignore errors loading descriptions
        }
        // Load semantic token descriptions from TEMPLATE.jsonc comments
        try {
            const templatePath2 = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
            const lines2 = fs.readFileSync(templatePath2, 'utf8').split(/\r?\n/);
            let inSemantic = false;
            for (const line of lines2) {
                if (/"semanticTokenColors"\s*:\s*\{/.test(line)) {
                    inSemantic = true;
                    continue;
                }
                if (inSemantic) {
                    if (/^\s*\}/.test(line)) {
                        break;
                    }
                    const m2 = line.match(/"([^"]+)"\s*:\s*(?:"#[0-9A-Fa-f]{6,8}"|\{[^\}]*\})\s*,?\s*\/\/\s*(.+)/);
                    if (m2) {
                        this.semanticDescriptions[m2[1]] = m2[2].trim();
                    }
                }
            }
        }
        catch (_) {
            // Ignore errors loading semantic descriptions
        }
        // Load TextMate token descriptions from TEMPLATE.jsonc comments
        try {
            const templatePath3 = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
            const templateContent = fs.readFileSync(templatePath3, 'utf8');
            const tokenSectionStart = templateContent.indexOf('"tokenColors"');
            if (tokenSectionStart !== -1) {
                const tokenSection = templateContent.slice(tokenSectionStart);
                const regex = /"([^\"]+)"\s*,?\s*\/\/\s*(.+)/g;
                let match;
                while ((match = regex.exec(tokenSection))) {
                    this.textmateDescriptions[match[1]] = match[2].trim();
                }
            }
        }
        catch (_) {
            // Ignore errors loading TextMate descriptions
        }
        this.update();
        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
        // Listen for theme changes
        const themeChangeListener = this.themeManager.onThemeChange((key, value) => {
            this.sendMessageToWebview({ type: 'themeChanged', key, value });
        });
        this.disposables.push(themeChangeListener);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'webviewReady':
                    // Webview loaded, send full theme state
                    this.sendMessageToWebview({ type: 'refreshTheme', theme: this.themeManager.getCurrentTheme() });
                    break;
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
                case 'loadCurrentTheme':
                    await this.handleLoadCurrentTheme();
                    break;
                case 'loadTheme':
                    await this.handleLoadTheme();
                    break;
                case 'exportTheme':
                    await this.handleExportTheme();
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
    /**
     * Post a message to the webview UI
     */
    sendMessageToWebview(message) {
        this.panel.webview.postMessage(message);
    }
    /**
     * Allow external callers to post messages to webview
     */
    postMessage(message) {
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
            // Notify webview and refresh all CSS variables
            this.sendMessageToWebview({ type: 'refreshTheme' });
            this.sendMessageToWebview({ type: 'themeLoaded' });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load empty theme: ${error}`);
        }
    }
    /**
     * Load a theme file and apply it
     */
    async handleLoadTheme() {
        const options = {
            canSelectMany: false,
            openLabel: 'Load Theme',
            filters: {
                'Theme Files': ['json', 'jsonc'],
                'VSIX Packages': ['vsix'],
                'CSS Files': ['css'],
                'All Files': ['*']
            }
        };
        const uris = await vscode.window.showOpenDialog(options);
        if (!uris || !uris[0]) {
            return;
        }
        try {
            await this.themeManager.loadThemeFromFile(uris[0].fsPath);
            this.update(); // Refresh UI to show loaded theme values
            vscode.window.showInformationMessage('Theme loaded successfully');
            // Refresh preview of all theme values
            this.sendMessageToWebview({ type: 'refreshTheme' });
            this.sendMessageToWebview({ type: 'themeLoaded' });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load theme: ${error}`);
        }
    }
    /**
     * Handle loading the active VS Code theme defaults into the editor
     */
    async handleLoadCurrentTheme() {
        try {
            this.themeManager.loadActiveThemeDefaults();
            this.update(); // Refresh the UI
            vscode.window.showInformationMessage('Current theme loaded for editing');
            this.sendMessageToWebview({ type: 'refreshTheme' });
            this.sendMessageToWebview({ type: 'themeLoaded' });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to load current theme: ${error}`);
        }
    }
    async handleExportTheme() {
        try {
            const currentTheme = this.themeManager.getCurrentTheme();
            const defaultFileName = `${currentTheme.name || 'theme'}.json`;
            const options = {
                defaultUri: vscode.Uri.file(path.join(vscode.workspace.rootPath || '', defaultFileName)),
                filters: { 'Theme Files': ['json', 'jsonc'] }
            };
            const uri = await vscode.window.showSaveDialog(options);
            if (!uri) {
                return;
            }
            const themeContent = JSON.stringify(currentTheme, null, 2);
            await fs.promises.writeFile(uri.fsPath, themeContent, 'utf8');
            vscode.window.showInformationMessage(`Theme exported to ${uri.fsPath}`);
            this.sendMessageToWebview({ type: 'themeExported' });
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to export theme: ${msg}`);
        }
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
        // Use active theme defaults for sections
        const defaultTheme = this.themeManager.getDefaultTheme();
        // Generate HTML sections
        const workbenchSection = this.generateWorkbenchColorsSection(currentTheme, defaultTheme);
        const semanticSection = this.generateSemanticTokensSection(currentTheme, defaultTheme);
        const textmateSection = this.generateTextMateTokensSection(currentTheme, defaultTheme);
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
				<button type="button" id="loadCurrentTheme" class="btn btn-secondary">Load Current Theme</button>
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
+            <script>
+              // Notify extension when webview is ready
+              vscode.postMessage({ type: 'webviewReady' });
+            </script>
		 </body>
		 </html>`;
    }
    generateWorkbenchColorsSection(currentTheme, templateTheme) {
        // Merge template keys with current theme values so all colors show
        const colors = { ...templateTheme.colors, ...currentTheme.colors };
        // Group colors by category
        const categories = {
            'Editor Core': [
                'editor.background', 'editor.foreground', 'editor.lineHighlightBackground',
                'editor.lineHighlightBorder', 'editor.selectionBackground',
                'editor.selectionHighlightBackground', 'editor.inactiveSelectionBackground',
                'editor.wordHighlightBackground', 'editor.wordHighlightStrongBackground',
                'editor.wordHighlightTextBackground', 'editor.rangeHighlightBackground',
                'editor.hoverHighlightBackground', 'editor.findMatchBackground',
                'editor.findMatchHighlightBackground', 'editor.findRangeHighlightBackground',
                'editor.foldBackground', 'editorCursor.foreground', 'editorLink.activeForeground',
                'editorWhitespace.foreground', 'editorIndentGuide.background1',
                'editorIndentGuide.activeBackground1', 'editorRuler.foreground',
                'editorBracketMatch.background', 'editorBracketMatch.border',
                'editorBracketHighlight.foreground1', 'editorBracketHighlight.foreground2',
                'editorBracketHighlight.foreground3', 'editorOverviewRuler.border'
            ],
            'Editor Widgets': [
                'editorWidget.background', 'editorWidget.border', 'editorSuggestWidget.background', 'editorSuggestWidget.border', 'editorSuggestWidget.foreground', 'editorSuggestWidget.highlightForeground', 'editorSuggestWidget.selectedBackground', 'editorHoverWidget.background', 'editorHoverWidget.border', 'editorGhostText.foreground', 'editorHint.foreground', 'editorInfo.foreground', 'editorWarning.foreground', 'editorError.foreground'
            ],
            'Editor Gutter': [
                'editorGutter.background', 'editorGutter.addedBackground', 'editorGutter.modifiedBackground', 'editorGutter.deletedBackground', 'editorGutter.foldingControlForeground', 'editorLineNumber.foreground', 'editorLineNumber.activeForeground'
            ],
            'Editor Inlay Hints': [
                'editorInlayHint.background', 'editorInlayHint.foreground', 'editorInlayHint.typeBackground', 'editorInlayHint.typeForeground', 'editorInlayHint.parameterBackground', 'editorInlayHint.parameterForeground'
            ],
            'Editor Groups & Tabs': [
                'editorGroup.border', 'editorGroup.dropBackground', 'editorGroupHeader.tabsBackground', 'editorGroupHeader.noTabsBackground', 'tab.activeBackground', 'tab.activeForeground', 'tab.activeModifiedBorder', 'tab.inactiveBackground', 'tab.inactiveForeground', 'tab.inactiveModifiedBorder', 'tab.border', 'tab.hoverBackground', 'tab.unfocusedActiveModifiedBorder', 'tab.unfocusedHoverBackground', 'tab.unfocusedInactiveModifiedBorder', 'tab.lastPinnedBorder'
            ],
            'Activity Bar': [
                'activityBar.background', 'activityBar.foreground', 'activityBar.inactiveForeground', 'activityBar.border', 'activityBar.activeBorder', 'activityBarBadge.background', 'activityBarBadge.foreground', 'activityBar.dropBorder', 'activityErrorBadge.background', 'activityErrorBadge.foreground', 'activityWarningBadge.background', 'activityWarningBadge.foreground',
            ],
            'Sidebar': [
                'sideBar.background', 'sideBar.foreground', 'sideBar.border', 'sideBarTitle.foreground', 'sideBarSectionHeader.background', 'sideBarSectionHeader.foreground', 'sideBarSectionHeader.border', 'sideBar.dropBackground'
            ],
            'Status Bar': [
                'statusBar.background', 'statusBar.foreground', 'statusBar.border', 'statusBar.debuggingBackground', 'statusBar.debuggingForeground', 'statusBar.noFolderBackground', 'statusBar.noFolderForeground', 'statusBarItem.activeBackground', 'statusBarItem.hoverBackground', 'statusBarItem.remoteBackground', 'statusBarItem.remoteForeground', 'statusBarItem.errorBackgroun', 'statusBarItem.errorForeground'
            ],
            'Title Bar': [
                'titleBar.activeBackground', 'titleBar.activeForeground', 'titleBar.inactiveBackground', 'titleBar.inactiveForeground', 'titleBar.border',
            ],
            'Panel': [
                'panel.background', 'panel.border', 'panel.dropBorder', 'panelTitle.activeBorder', 'panelTitle.activeForeground', 'panelTitle.inactiveForeground', 'panelInput.border',
            ],
            'Terminal': [
                'terminal.background', 'terminal.foreground', 'terminal.border', 'terminalCursor.background', 'terminalCursor.foreground', 'terminal.ansiBlack', 'terminal.ansiBlue', 'terminal.ansiCyan', 'terminal.ansiGreen', 'terminal.ansiMagenta', 'terminal.ansiRed', 'terminal.ansiWhite', 'terminal.ansiYellow', 'terminal.ansiBrightBlack', 'terminal.ansiBrightBlue', 'terminal.ansiBrightCyan', 'terminal.ansiBrightGreen', 'terminal.ansiBrightMagenta', 'terminal.ansiBrightRed', 'terminal.ansiBrightWhite', 'terminal.ansiBrightYellow', 'terminal.selectionBackground',
            ],
            'Lists & Trees': [
                'list.activeSelectionBackground', 'list.activeSelectionForeground', 'list.inactiveSelectionBackground', 'list.inactiveSelectionForeground', 'list.hoverBackground', 'list.hoverForeground', 'list.focusOutline', 'list.inactiveFocusOutline', 'list.errorForeground', 'list.warningForeground', 'list.filterMatchBackground', 'list.highlightForeground'
            ],
            'Input Controls': [
                'input.background', 'input.foreground', 'input.border', 'input.placeholderForeground', 'inputOption.activeBackground', 'inputOption.activeBorder', 'inputOption.activeForeground', 'inputOption.hoverBackground'
            ],
            'Buttons & Badges': [
                'button.background', 'button.foreground', 'button.hoverBackground', 'button.secondaryBackground', 'button.secondaryForeground', 'button.secondaryHoverBackground', 'badge.background', 'badge.foreground'
            ],
            'Dropdown': [
                'dropdown.background', 'peekViewTitle.background', 'peekViewTitleDescription.foreground', 'peekViewTitleLabel.foreground'
            ],
            'Merge Conflicts': [
                'merge.border', 'merge.commonContentBackground', 'merge.commonHeaderBackground', 'merge.currentContentBackground', 'merge.currentHeaderBackground', 'merge.incomingContentBackground', 'merge.incomingHeaderBackground'
            ],
            'Notifications & Settings': [
                'notifications.background', 'notifications.border', 'notifications.foreground', 'notificationLink.foreground', 'notificationsErrorIcon.foreground', 'notificationsInfoIcon.foreground', 'notificationsWarningIcon.foreground', 'settings.headerForeground', 'settings.textInputForeground', 'settings.modifiedItemIndicator'
            ],
            'Git Decorations': [
                'gitDecoration.addedResourceForeground', 'gitDecoration.modifiedResourceForeground', 'gitDecoration.deletedResourceForeground', 'gitDecoration.untrackedResourceForeground', 'gitDecoration.ignoredResourceForeground', 'gitDecoration.conflictingResourceForeground', 'gitDecoration.submoduleResourceForeground'
            ],
            'Text Links': [
                'textLink.foreground', 'textLink.activeForeground', 'descriptionForeground'
            ],
            'Debug': [
                'debugToolBar.background', 'debugIcon.breakpointForeground', 'debugIcon.startForeground', 'debugIcon.pauseForeground', 'debugIcon.stopForeground', 'debugIcon.disconnectForeground', 'debugIcon.restartForeground', 'debugIcon.stepOverForeground', 'debugIcon.stepIntoForeground', 'debugIcon.stepOutForeground', 'debugIcon.continueForeground'
            ],
            'Charts': [
                'charts.foreground', 'charts.lines', 'charts.red', 'charts.blue', 'charts.yellow', 'charts.orange', 'charts.green', 'charts.purple'
            ],
            'Extensions & Welcome Page': [
                'extensionButton.prominentBackground', 'extensionButton.prominentForeground', 'extensionButton.prominentHoverBackground', 'extensionBadge.remoteBackground', 'extensionBadge.remoteForeground', 'welcomePage.progress.background', 'welcomePage.progress.foreground', 'welcomePage.tileBackground', 'welcomePage.tileBorder', 'welcomePage.tileHoverBackground'
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
                // Determine color picker value (strip alpha if present)
                const pickerValue = safeValue.length === 9 ? safeValue.slice(0, 7) : safeValue;
                // Compute alpha percentage for transparency slider (0-100)
                const alphaPercent = safeValue.length === 9
                    ? Math.round(parseInt(safeValue.slice(7, 9), 16) / 255 * 100)
                    : 100;
                html += `<div class="color-item" data-search="${key.toLowerCase()} ${description.toLowerCase()}">
					<div class="color-info">
						<label class="color-label">${key}</label>
						<p class="color-description">${description}</p>
					</div>
					<div class="color-controls">
						<input type="color" class="color-picker" name="${key}" value="${pickerValue}" title="Color picker">
						<input type="text" class="hex-input" name="${key}" value="${safeValue}" 
							   pattern="^#[0-9a-fA-F]{6,8}$" title="Hex color value">
					   <input type="range" class="alpha-slider" min="0" max="100" value="${alphaPercent}" name="alpha_${key}" title="Opacity (%)">
					   <input type="number" class="alpha-input" min="0" max="100" value="${alphaPercent}" name="alpha_${key}" title="Opacity (%)">
					</div>
				</div>`;
            });
            html += `</div></div>`;
        }
        return html;
    }
    generateSemanticTokensSection(currentTheme, templateTheme) {
        // Merge template semantic tokens with current theme values
        const semanticColors = { ...templateTheme.semanticTokenColors, ...currentTheme.semanticTokenColors };
        // Define semantic groups matching TEMPLATE.jsonc comments
        const semanticGroups = {
            'Types': ['class', 'interface', 'enum', 'struct', 'type', 'typeParameter'],
            'Variables': ['variable', 'parameter', 'property', 'enumMember'],
            'Values & Literals': ['string', 'number', 'boolean', 'regexp'],
            'Functions': ['function', 'method'],
            'Keywords': ['keyword', 'modifier', 'namespace'],
            'Comments': ['comment'],
            'Special Modifiers': ['*.static', '*.readonly', '*.decorator', '*.abstract']
        };
        let html = '';
        // Render each semantic group
        for (const [groupName, keys] of Object.entries(semanticGroups)) {
            html += `<div class="color-category">
						<h3 class="category-title">${groupName}</h3>
						<div class="category-content">`;
            keys.forEach(key => {
                const raw = semanticColors[key];
                if (!raw)
                    return;
                const isObj = typeof raw !== 'string';
                const colorVal = isObj ? raw.foreground || '' : raw;
                const safeValue = this.ensureValidHexColor(colorVal);
                const fontStyle = isObj ? raw.fontStyle : '';
                const description = this.getSemanticTokenDescription(key);
                // Determine color picker value for semantic tokens
                const semPicker = safeValue.length === 9 ? safeValue.slice(0, 7) : safeValue;
                // Compute alpha percentage for transparency slider (0-100)
                const alphaPercent = safeValue.length === 9
                    ? Math.round(parseInt(safeValue.slice(7, 9), 16) / 255 * 100)
                    : 100;
                html += `<div class="color-item" data-search="${key}">
							<div class="color-info">
								<label class="color-label">${key}</label>
								<p class="color-description">${description}</p>
							</div>
							<div class="color-controls">
								<input type="color" class="color-picker" name="semantic_${key}" value="${semPicker}" />
								<input type="text" class="hex-input" name="semantic_${key}" value="${safeValue}" pattern="^#[0-9a-fA-F]{6,8}$" />
								<input type="range" class="alpha-slider" min="0" max="100" value="${alphaPercent}" name="alpha_semantic_${key}" title="Alpha (%)" />
								<input type="number" class="alpha-input" min="0" max="100" value="${alphaPercent}" name="alpha_semantic_${key}" title="Alpha (%)" />`;
                if (isObj) {
                    html += `<select name="semantic_${key}_fontStyle">
								<option value=""${!fontStyle ? ' selected' : ''}>normal</option>
								<option value="italic"${fontStyle === 'italic' ? ' selected' : ''}>italic</option>
								<option value="bold"${fontStyle === 'bold' ? ' selected' : ''}>bold</option>
								<option value="underline"${fontStyle === 'underline' ? ' selected' : ''}>underline</option>
							</select>`;
                }
                html += `      </div>
						</div>`;
            });
            html += `</div></div>`;
        }
        return html;
    }
    generateTextMateTokensSection(currentTheme, templateTheme) {
        // Render TextMate tokens by grouping each defined scope under its category
        const tokenColors = (currentTheme.tokenColors && currentTheme.tokenColors.length > 0)
            ? currentTheme.tokenColors : templateTheme.tokenColors || [];
        const textmateGroups = {
            'Base Text & Structure': [
                'source',
                'support.type.property-name.css'
            ],
            'Punctuation & Delimiters': [
                'punctuation',
                'punctuation.terminator',
                'punctuation.definition.tag',
                'punctuation.separator',
                'punctuation.definition.string',
                'punctuation.section.block'
            ],
            'Class Definitions': ['entity.name.type.class'],
            'Interface Definitions': ['entity.name.type.interface', 'entity.name.type'],
            'Struct Definitions': ['entity.name.type.struct'],
            'Enum Definitions': ['entity.name.type.enum'],
            'Built-in Types': ['support.type'],
            'Parameter Types': ['variable.type.parameter', 'variable.parameter.type'],
            'Method Definitions': ['entity.name.function.method', 'meta.function.method'],
            'Function Names': ['entity.name.function', 'support.function', 'meta.function-call.generic'],
            'Function Variables': ['variable.function'],
            'Preprocessor Functions': ['entity.name.function.preprocessor', 'meta.preprocessor'],
            'Additional Preprocessor': ['meta.preprocessor'],
            'Decorators': ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'],
            'Variable Names': ['variable', 'meta.variable', 'variable.other.object.property', 'variable.other.readwrite.alias'],
            'Object Variables': ['variable.other.object'],
            'Global Variables': ['variable.other.global', 'variable.language.this'],
            'Local Variables': ['variable.other.local'],
            'Function Parameters': ['variable.parameter', 'meta.parameter'],
            'Property Access': ['variable.other.property', 'meta.property'],
            'Constants & Readonly': ['variable.other.constant', 'variable.readonly'],
            'Object Literal Keys': ['meta.object-literal.key'],
            'Language Keywords': ['keyword'],
            'Import Keywords': ['keyword.control.import', 'keyword.control.from', 'keyword.import'],
            'Exception Keywords': ['keyword.control.exception', 'keyword.control.trycatch'],
            'Modifiers & Types': ['storage.modifier', 'keyword.modifier', 'storage.type'],
            'Operators': ['keyword.operator'],
            'String Literals': ['string', 'string.other.link', 'markup.inline.raw.string.markdown'],
            'Escape Sequences & Placeholders': ['constant.character.escape', 'constant.other.placeholder'],
            'Numeric Literals': ['constant.numeric'],
            'Boolean & JSON Constants': ['constant.language.boolean', 'constant.language.json'],
            'Labels': ['entity.name.label', 'punctuation.definition.label'],
            'Comments': ['comment', 'punctuation.definition.comment'],
            'Documentation Comments': ['comment.documentation', 'comment.line.documentation'],
            'Namespaces': [
                'entity.name.namespace', 'storage.modifier.namespace', 'markup.bold.markdown'
            ],
            'Modules': [
                'entity.name.module', 'storage.modifier.module'
            ],
            'Underlined Links': ['markup.underline.link'],
            'HTML/XML Tag Names': ['entity.name.tag'],
            'Component Class Names': ['support.class.component'],
            'HTML Attributes & Values': ['entity.other.attribute-name', 'meta.attribute'],
            'Information Tokens': ['token.info-token'],
            'Warning Tokens': ['token.warn-token'],
            'Error Tokens': ['token.error-token'],
            'Debug Output Tokens': ['token.debug-token']
        };
        let html = '';
        for (const [groupName, scopes] of Object.entries(textmateGroups)) {
            html += `<div class="color-category"><h3 class="category-title">${groupName}</h3><div class="category-content">`;
            scopes.forEach(scope => {
                // find matching token entry
                const token = tokenColors.find(t => {
                    const tScopes = Array.isArray(t.scope) ? t.scope : [t.scope];
                    return tScopes.includes(scope);
                });
                const fg = token?.settings?.foreground;
                if (typeof fg !== 'string') {
                    return;
                }
                const safeValue = this.ensureValidHexColor(fg);
                const description = this.getTextMateTokenDescription(scope);
                // Determine color picker value for TextMate tokens
                const tmPicker = safeValue.length === 9 ? safeValue.slice(0, 7) : safeValue;
                // Compute alpha percentage for transparency slider (0-100)
                const alphaPercent = safeValue.length === 9
                    ? Math.round(parseInt(safeValue.slice(7, 9), 16) / 255 * 100)
                    : 100;
                html += `<div class="color-item" data-search="${scope}">` +
                    `<div class="color-info"><label class="color-label">${scope}</label>` +
                    `<p class="color-description">${description}</p></div>` +
                    `<div class="color-controls">` +
                    `<input type="color" class="color-picker" name="textmate_${scope}" value="${tmPicker}" />` +
                    `<input type="text" class="hex-input" name="textmate_${scope}" value="${safeValue}" pattern="^#[0-9a-fA-F]{6,8}$" />` +
                    `<input type="range" class="alpha-slider" min="0" max="100" value="${alphaPercent}" name="alpha_textmate_${scope}" title="Alpha (%)" />` +
                    `<input type="number" class="alpha-input" min="0" max="100" value="${alphaPercent}" name="alpha_textmate_${scope}" title="Alpha (%)" />` +
                    `</div></div>`;
            });
            html += `</div></div>`;
        }
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
        return this.colorDescriptions[key] || key;
    }
    getTextMateTokenDescription(key) {
        // Return dynamic description if loaded
        if (this.textmateDescriptions[key]) {
            return this.textmateDescriptions[key];
        }
        const descriptions = {
            'source': 'Base source text',
            'support.type.property-name.css': 'CSS property names',
            'entity.name.function': 'Function names and declarations',
            'keyword': 'Language keywords',
            'string': 'String literals',
            'comment': 'Comments',
            // Markup & HTML descriptions
            'markup.underline.link': 'Underlined links in markup languages',
            'entity.name.tag': 'HTML/XML tag names: <div>, <span>, <component>',
            'support.class.component': 'Component class names in frameworks like React, Vue',
            'entity.other.attribute-name': 'HTML attributes: class, id, src, href',
            'meta.attribute': 'HTML attributes: class, id, src, href',
            // Debug Token descriptions
            'token.info-token': 'Information messages in debug/log output',
            'token.warn-token': 'Warning messages in debug/log output',
            'token.error-token': 'Error messages in debug/log output',
            'token.debug-token': 'Debug-specific messages and output',
            // Punctuation & Delimiters
            'punctuation': 'Punctuation characters and delimiters',
            'punctuation.terminator': 'Statement terminators like semicolons',
            'punctuation.definition.tag': 'Tag delimiters in markup like < and >',
            'punctuation.separator': 'Separators like commas and colons',
            'punctuation.definition.string': 'String delimiters like quotes',
            'punctuation.section.block': 'Block delimiters like braces and brackets',
            // Classes & Types
            'entity.name.type.class': 'Class definition names',
            'entity.name.type.interface': 'Interface definition names',
            'entity.name.type': 'Type definition names',
            'entity.name.type.struct': 'Struct definition names',
            'entity.name.type.enum': 'Enum definition names',
            'support.type': 'Built-in type names',
            // Parameters
            'variable.type.parameter': 'Parameter type annotations',
            'variable.parameter.type': 'Parameter type annotations',
            // Methods & Functions
            'meta.function.method': 'Method definitions and calls',
            'entity.name.function.method': 'Method names in classes and objects',
            'support.function': 'Built-in function names',
            'variable.function': 'Function variables and references',
            // Preprocessor & Decorators
            'entity.name.function.preprocessor': 'Preprocessor function names',
            'meta.preprocessor': 'Preprocessor directives',
            'meta.decorator': 'Decorator syntax',
            'punctuation.decorator': 'Decorator punctuation like @',
            'entity.name.function.decorator': 'Decorator function names',
            // Variables & Properties
            'variable': 'Variable names',
            'meta.variable': 'Variable declarations',
            'variable.other.object.property': 'Object property variable names',
            'variable.other.readwrite.alias': 'Variable read/write aliases',
            'variable.other.object': 'Object variable references',
            'variable.other.global': 'Global variable references',
            'variable.language.this': '"this" keyword references',
            'variable.other.local': 'Local variable references',
            'variable.parameter': 'Function parameter names',
            'meta.parameter': 'Parameter declarations',
            'variable.other.property': 'Property access in objects',
            'meta.property': 'Property syntax definitions',
            'variable.other.constant': 'Constant variable names',
            'variable.readonly': 'Read-only variable names',
            'meta.object-literal.key': 'Object literal key names',
            // Keywords & Operators
            'keyword.operator': 'Operator keywords',
            // Strings & Literals
            'string.other.link': 'Inline link text in markup',
            'markup.inline.raw.string.markdown': 'Inline code spans in markdown',
            'constant.character.escape': 'Escape sequences in strings',
            'constant.other.placeholder': 'Template string placeholders',
            'constant.numeric': 'Numeric literals',
            'constant.language.boolean': 'Boolean constants true and false',
            'constant.language.json': 'JSON constants like null, true, false',
            // Labels
            'entity.name.label': 'Label names in code like case labels',
            'punctuation.definition.label': 'Label declaration punctuation',
            // Comments & Documentation
            'comment.documentation': 'Documentation comments like /** */',
            'comment.line.documentation': 'Line documentation comments like ///',
            // Namespaces & Modules
            'entity.name.namespace': 'Namespace declaration names',
            'storage.modifier.namespace': 'Namespace modifiers',
            'markup.bold.markdown': 'Bold text in markdown',
            'entity.name.module': 'Module declaration names',
            'storage.modifier.module': 'Module modifiers'
        };
        return descriptions[key] || key;
    }
    getSemanticTokenDescription(key) {
        return this.semanticDescriptions[key] || key;
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