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
        console.log('ThemeEditorPanel.createOrShow called with:', extensionUri.fsPath);
        const column = vscode.ViewColumn.Beside;
        if (ThemeEditorPanel.currentPanel) {
            console.log('Revealing existing panel');
            ThemeEditorPanel.currentPanel.panel.reveal(column);
            return;
        }
        try {
            console.log('Creating new webview panel...');
            const panel = vscode.window.createWebviewPanel('themeEditor', 'Theme Editor Live', column, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionUri.fsPath, 'media'))],
                retainContextWhenHidden: true
            });
            console.log('Webview panel created successfully');
            ThemeEditorPanel.currentPanel = new ThemeEditorPanel(panel, extensionUri, themeManager);
            console.log('ThemeEditorPanel instance created successfully');
        }
        catch (error) {
            console.error('Failed to create Theme Editor webview:', error);
            vscode.window.showErrorMessage(`Failed to create Theme Editor: ${error instanceof Error ? error.message : String(error)}`);
        }
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
        console.log('ThemeEditorPanel constructor called');
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.themeManager = themeManager;
        console.log('Basic properties set');
        // Load workbench UI color descriptions from TEMPLATE.jsonc comments
        try {
            const templatePath = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
            console.log('Loading template from:', templatePath);
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
            console.log('Loaded color descriptions:', Object.keys(this.colorDescriptions).length);
        }
        catch (e) {
            console.error('Error loading color descriptions:', e);
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
        catch {
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
        catch {
            // Ignore errors loading TextMate descriptions
        }
        try {
            this.update();
        }
        catch (error) {
            console.error('Failed to initialize Theme Editor webview:', error);
            vscode.window.showErrorMessage(`Failed to initialize Theme Editor: ${error instanceof Error ? error.message : String(error)}`);
        }
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
                case 'reloadTemplate':
                    await this.handleReloadTemplate();
                    break;
                case 'openSetting':
                    await this.handleOpenSetting(message.setting);
                    break;
                case 'updateTemplateElement':
                    await this.handleUpdateTemplateElement(message.category, message.key, message.value, message.applyImmediately);
                    break;
                case 'syncTemplate':
                    this.handleSyncTemplate();
                    break;
                case 'navigateToSetting':
                    this.handleNavigateToSetting(message.setting);
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
            // Apply empty theme workbench colors
            for (const [key, value] of Object.entries(emptyTheme.colors || {})) {
                await this.themeManager.applyLiveColor(key, value);
            }
            // Apply empty theme semantic tokens
            for (const [key, value] of Object.entries(emptyTheme.semanticTokenColors || {})) {
                await this.themeManager.applyLiveColor(`semantic_${key}`, typeof value === 'string' ? value : value.foreground || '#ffffff');
            }
            // Apply empty theme TextMate tokens
            for (const token of emptyTheme.tokenColors || []) {
                if (token.scope && token.settings) {
                    const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
                    for (const scope of scopes) {
                        if (token.settings.foreground) {
                            await this.themeManager.applyLiveColor(`textmate_${scope}`, token.settings.foreground);
                        }
                    }
                }
            }
            this.update(); // Refresh the UI
            vscode.window.showInformationMessage('Empty theme loaded successfully');
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
    async handleReloadTemplate() {
        try {
            await this.themeManager.reloadTemplate();
            // Send updated template stats to webview
            const stats = this.themeManager.getTemplateStats();
            this.sendMessageToWebview({
                type: 'templateReloaded',
                stats
            });
            vscode.window.showInformationMessage(`Template reloaded: ${stats.total} elements loaded`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to reload template: ${errorMessage}`);
            this.sendMessageToWebview({
                type: 'templateReloadError',
                error: errorMessage
            });
        }
    }
    async handleUpdateTemplateElement(category, key, value, applyImmediately = false) {
        try {
            await this.themeManager.updateTemplateElement(category, key, value, applyImmediately);
            this.sendMessageToWebview({
                type: 'templateElementUpdated',
                category,
                key,
                value,
                applied: applyImmediately
            });
            if (applyImmediately) {
                vscode.window.showInformationMessage(`Template element ${category}.${key} updated and applied`);
            }
            else {
                vscode.window.showInformationMessage(`Template element ${category}.${key} updated`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to update template element: ${errorMessage}`);
            this.sendMessageToWebview({
                type: 'templateElementUpdateError',
                error: errorMessage,
                category,
                key
            });
        }
    }
    handleSyncTemplate() {
        try {
            this.themeManager.syncTemplateWithUI();
            this.sendMessageToWebview({
                type: 'templateSynced'
            });
            vscode.window.showInformationMessage('Template synced with UI');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Failed to sync template: ${errorMessage}`);
            this.sendMessageToWebview({
                type: 'templateSyncError',
                error: errorMessage
            });
        }
    }
    handleNavigateToSetting(setting) {
        // Open VS Code settings to the specific setting
        vscode.commands.executeCommand('workbench.action.openSettings', setting);
    }
    refresh() {
        this.update();
    }
    update() {
        try {
            console.log('Updating webview HTML...');
            const webview = this.panel.webview;
            this.panel.webview.html = this.getHtmlForWebview(webview);
            console.log('Webview HTML updated successfully');
        }
        catch (error) {
            console.error('Failed to update Theme Editor webview:', error);
            vscode.window.showErrorMessage(`Failed to update Theme Editor: ${error instanceof Error ? error.message : String(error)}`);
        }
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
			<div id="loading-indicator" style="display: block; text-align: center; padding: 20px; color: #666;">
				<div>🎨 Loading Theme Editor...</div>
				<div style="font-size: 0.9em; margin-top: 10px;">Please wait while the interface loads</div>
			</div>
			
			<div id="main-content" style="display: none;">
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

			<!-- Legend Popup -->
			<button class="legend-trigger" id="legendTrigger" title="Show visual indicators guide"></button>
			${this.generateLegend()}

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
			</div>

			<script src="${scriptUri}"></script>
            <script>
              // Show main content immediately if service worker fails
              function showContent() {
                document.getElementById('loading-indicator').style.display = 'none';
                document.getElementById('main-content').style.display = 'block';
                // Notify extension when webview is ready
                if (typeof vscode !== 'undefined') {
                  vscode.postMessage({ type: 'webviewReady' });
                }
              }
              
              // Multiple fallbacks to ensure content loads
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                  setTimeout(showContent, 200);
                });
              } else {
                setTimeout(showContent, 100);
              }
              
              // Emergency fallback - always show after 2 seconds
              setTimeout(showContent, 2000);
            </script>
		 </body>
		 </html>`;
    }
    parseTemplateCategoriesFromFile() {
        const categories = {};
        try {
            const templatePath = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const lines = templateContent.split(/\r?\n/);
            let currentCategory = '';
            let inColorsSection = false;
            for (const line of lines) {
                // Check if we're entering the colors section
                if (/"colors"\s*:\s*\{/.test(line)) {
                    inColorsSection = true;
                    continue;
                }
                // Check if we're leaving the colors section
                if (inColorsSection && /^\s*\},?\s*$/.test(line) && !line.includes('"')) {
                    inColorsSection = false;
                    break;
                }
                if (!inColorsSection)
                    continue;
                // Look for category headers like "// --- Base Colors ---"
                const categoryMatch = line.match(/^\s*\/\/\s*---\s*(.+?)\s*---/);
                if (categoryMatch) {
                    currentCategory = categoryMatch[1].trim();
                    if (!categories[currentCategory]) {
                        categories[currentCategory] = [];
                    }
                    continue;
                }
                // Look for color property definitions
                const colorMatch = line.match(/^\s*"([^"]+)"\s*:/);
                if (colorMatch && currentCategory) {
                    const colorKey = colorMatch[1];
                    if (!categories[currentCategory].includes(colorKey)) {
                        categories[currentCategory].push(colorKey);
                    }
                }
            }
            console.log('Parsed template categories:', Object.keys(categories));
            console.log('Total color properties:', Object.values(categories).flat().length);
        }
        catch (error) {
            console.error('Error parsing template categories:', error);
        }
        return categories;
    }
    generateWorkbenchColorsSection(currentTheme, templateTheme) {
        // Merge template keys with current theme values so all colors show
        const colors = { ...templateTheme.colors, ...currentTheme.colors };
        // Parse categories from TEMPLATE.jsonc dynamically
        const categories = this.parseTemplateCategoriesFromFile();
        // If parsing failed, fall back to basic categories
        if (Object.keys(categories).length === 0) {
            categories['Base Colors'] = Object.keys(colors);
        }
        // Add uncategorized colors to "Other UI Elements"
        const categorizedKeys = new Set(Object.values(categories).flat());
        const uncategorizedKeys = Object.keys(colors).filter(key => !categorizedKeys.has(key));
        if (uncategorizedKeys.length > 0) {
            if (!categories['Other UI Elements']) {
                categories['Other UI Elements'] = [];
            }
            categories['Other UI Elements'].push(...uncategorizedKeys);
        }
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
            keys.forEach((key) => {
                const value = colors[key] || '#ffffff';
                const safeValue = this.ensureValidHexColor(value);
                const description = this.getColorDescription(key);
                // Determine color picker value (strip alpha if present)
                const pickerValue = safeValue.length === 9 ? safeValue.slice(0, 7) : safeValue;
                // Compute alpha percentage for transparency slider (0-100)
                const alphaPercent = safeValue.length === 9
                    ? Math.round(parseInt(safeValue.slice(7, 9), 16) / 255 * 100)
                    : 100;
                // Determine special classes and indicators
                const requiresOpacity = safeValue.length === 9 || key.includes('opacity') || key.includes('alpha');
                const requiresTransparency = this.requiresTransparency(key);
                const requiresSetting = this.requiresSpecificSetting(key);
                const itemClasses = ['color-item'];
                if (requiresOpacity)
                    itemClasses.push('requires-opacity');
                if (requiresTransparency)
                    itemClasses.push('requires-transparency');
                if (requiresSetting)
                    itemClasses.push('requires-setting');
                html += `<div class="${itemClasses.join(' ')}" data-search="${key.toLowerCase()} ${description.toLowerCase()}">
					<span class="border-indicator"></span>`;
                // Add status badges with better tooltips
                if (requiresSetting) {
                    const settingName = this.getNavigationTarget(key);
                    html += `<span class="status-badge setting-name" data-setting="${settingName}" data-tooltip="Click to find: ${settingName}" data-tooltip-class="tooltip-setting-info">⚙️ ${settingName}</span>`;
                }
                if (requiresTransparency) {
                    html += `<span class="status-badge transparency-required" data-tooltip="This color MUST use transparency (alpha) to work correctly" data-tooltip-class="tooltip-opacity-info"></span>`;
                }
                // Removed opacity-required badge (top left opacity box) per user request
                html += `<div class="color-info">
						<label class="color-label">
							${key}
						</label>
						<p class="color-description">${description}${requiresSetting ? ` <span class="setting-warning">⚠️ Requires "${this.getNavigationTarget(key)}" to be enabled to take effect.</span>` : ''}</p>
					</div>
					<div class="color-controls">
						<div class="color-inputs-row">
							<input type="color" class="color-picker" name="${key}" value="${pickerValue}" title="Color picker">
							<input type="text" class="hex-input" name="${key}" value="${safeValue}" 
								   pattern="^#[0-9a-fA-F]{6,8}$" title="Hex color value">
						</div>
						<div class="color-slider-row">
							<input type="range" class="color-slider${requiresOpacity ? ' opacity-slider' : ''}" min="0" max="100" value="${alphaPercent}" name="alpha_${key}" title="Opacity (%)">
							<span class="slider-value${requiresOpacity ? ' opacity-value' : ''}">${alphaPercent}</span>
						</div>
					</div>
				</div>`;
            });
            html += `</div></div>`;
        }
        return html;
    }
    parseSemanticCategoriesFromFile() {
        const categories = {};
        try {
            const templatePath = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const lines = templateContent.split(/\r?\n/);
            let currentCategory = '';
            let inSemanticSection = false;
            for (const line of lines) {
                // Check if we're entering the semanticTokenColors section
                if (/"semanticTokenColors"\s*:\s*\{/.test(line)) {
                    inSemanticSection = true;
                    continue;
                }
                // Check if we're leaving the semanticTokenColors section
                if (inSemanticSection && /^\s*\},?\s*$/.test(line) && !line.includes('"')) {
                    inSemanticSection = false;
                    break;
                }
                if (!inSemanticSection)
                    continue;
                // Look for category headers like "// --- Types ---"
                const categoryMatch = line.match(/^\s*\/\/\s*---\s*(.+?)\s*---/);
                if (categoryMatch) {
                    currentCategory = categoryMatch[1].trim();
                    if (!categories[currentCategory]) {
                        categories[currentCategory] = [];
                    }
                    continue;
                }
                // Look for semantic token property definitions
                const tokenMatch = line.match(/^\s*"([^"]+)"\s*:/);
                if (tokenMatch && currentCategory) {
                    const tokenKey = tokenMatch[1];
                    // Skip internal properties that start with dots
                    if (!tokenKey.startsWith('.') && !categories[currentCategory].includes(tokenKey)) {
                        categories[currentCategory].push(tokenKey);
                    }
                }
            }
            console.log('Parsed semantic token categories:', Object.keys(categories));
            console.log('Total semantic tokens:', Object.values(categories).flat().length);
        }
        catch (error) {
            console.error('Error parsing semantic token categories:', error);
        }
        return categories;
    }
    generateSemanticTokensSection(currentTheme, templateTheme) {
        // Merge template semantic tokens with current theme values
        const semanticColors = { ...templateTheme.semanticTokenColors, ...currentTheme.semanticTokenColors };
        // Parse semantic groups from TEMPLATE.jsonc dynamically
        const semanticGroups = this.parseSemanticCategoriesFromFile();
        // If parsing failed, fall back to basic categories
        if (Object.keys(semanticGroups).length === 0) {
            semanticGroups['Types'] = ['class', 'interface', 'enum', 'struct', 'type', 'typeParameter'];
            semanticGroups['Variables'] = ['variable', 'parameter', 'property', 'enumMember'];
            semanticGroups['Values & Literals'] = ['string', 'number', 'boolean', 'regexp'];
            semanticGroups['Functions'] = ['function', 'method'];
            semanticGroups['Keywords'] = ['keyword', 'modifier', 'namespace'];
            semanticGroups['Comments'] = ['comment'];
            semanticGroups['Special Modifiers'] = ['*.static', '*.readonly', '*.decorator', '*.abstract'];
        }
        // Add uncategorized semantic tokens
        const categorizedKeys = new Set(Object.values(semanticGroups).flat());
        const uncategorizedKeys = Object.keys(semanticColors).filter(key => !categorizedKeys.has(key));
        if (uncategorizedKeys.length > 0) {
            if (!semanticGroups['Other Semantic Tokens']) {
                semanticGroups['Other Semantic Tokens'] = [];
            }
            semanticGroups['Other Semantic Tokens'].push(...uncategorizedKeys);
        }
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
                // Determine special classes for semantic tokens
                const requiresOpacity = safeValue.length === 9;
                const requiresTransparency = key.includes('inactive') || key.includes('muted') || key.includes('deprecated');
                const itemClasses = ['color-item'];
                if (requiresOpacity)
                    itemClasses.push('requires-opacity');
                if (requiresTransparency)
                    itemClasses.push('requires-transparency');
                html += `<div class="${itemClasses.join(' ')}" data-search="${key}">
							<span class="border-indicator"></span>`;
                // Add status badges for semantic tokens with better tooltips
                const settingName = "editor.semanticTokenColorCustomizations";
                html += `<span class="status-badge setting-name" data-setting="${settingName}" data-tooltip="Click to find: ${settingName}" data-tooltip-class="tooltip-setting-info">${settingName}</span>`;
                if (requiresTransparency) {
                    html += `<span class="status-badge transparency-required" data-tooltip="This semantic token MUST use transparency for proper layering" data-tooltip-class="tooltip-opacity-info"></span>`;
                }
                // Removed opacity-required badge (semantic token) per user request
                html += `<div class="color-info">
								<label class="color-label">
									${key}
								</label>
								<p class="color-description">${description}</p>
							</div>
							<div class="color-controls">
								<div class="color-inputs-row">
									<input type="color" class="color-picker" name="semantic_${key}" value="${semPicker}" />
									<input type="text" class="hex-input" name="semantic_${key}" value="${safeValue}" pattern="^#[0-9a-fA-F]{6,8}$" />
								</div>
								<div class="color-slider-row">
									<input type="range" class="color-slider${requiresOpacity ? ' opacity-slider' : ''}" min="0" max="100" value="${alphaPercent}" name="alpha_semantic_${key}" title="Alpha (%)" />
									<span class="slider-value${requiresOpacity ? ' opacity-value' : ''}">${alphaPercent}</span>`;
                if (isObj) {
                    html += `<select name="semantic_${key}_fontStyle">
								<option value=""${!fontStyle ? ' selected' : ''}>normal</option>
								<option value="italic"${fontStyle === 'italic' ? ' selected' : ''}>italic</option>
								<option value="bold"${fontStyle === 'bold' ? ' selected' : ''}>bold</option>
								<option value="underline"${fontStyle === 'underline' ? ' selected' : ''}>underline</option>
							</select>`;
                }
                html += `      		</div>
							</div>
						</div>`;
            });
            html += `</div></div>`;
        }
        return html;
    }
    parseTextMateCategoriesFromFile() {
        const categories = {};
        try {
            const templatePath = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const lines = templateContent.split(/\r?\n/);
            let currentCategory = '';
            let inTokenColorsSection = false;
            let inScopeArray = false;
            let inCurrentTokenEntry = false;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Check if we're entering the tokenColors section
                if (/"tokenColors"\s*:\s*\[/.test(line)) {
                    inTokenColorsSection = true;
                    continue;
                }
                // Check if we're leaving the tokenColors section (looking for closing bracket of the array)
                if (inTokenColorsSection && /^\s*\]\s*$/.test(line)) {
                    inTokenColorsSection = false;
                    break;
                }
                if (!inTokenColorsSection)
                    continue;
                // Look for category headers like "// --- Source & Base Structure ---"
                const categoryMatch = line.match(/^\s*\/\/\s*---\s*(.+?)\s*---/);
                if (categoryMatch) {
                    currentCategory = categoryMatch[1].trim();
                    if (!categories[currentCategory]) {
                        categories[currentCategory] = [];
                    }
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
                if (!inCurrentTokenEntry || !currentCategory)
                    continue;
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
            console.log(`[TextMate] Parsed ${Object.keys(categories).length} categories with ${Object.values(categories).flat().length} total tokens`);
        }
        catch (error) {
            console.error('Error parsing TextMate token categories:', error);
        }
        return categories;
    }
    generateTextMateTokensSection(currentTheme, templateTheme) {
        // Render TextMate tokens by grouping each defined scope under its category
        const tokenColors = (currentTheme.tokenColors && currentTheme.tokenColors.length > 0)
            ? currentTheme.tokenColors : templateTheme.tokenColors || [];
        // Create a map for faster token lookup
        const tokenMap = new Map();
        tokenColors.forEach(token => {
            if (token.scope && token.settings) {
                const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
                scopes.forEach(scope => {
                    if (scope) {
                        tokenMap.set(scope, token.settings);
                    }
                });
            }
        });
        console.log(`[TextMate] Loaded ${tokenMap.size} token mappings`);
        console.log(`[TextMate] token.debug-token value:`, tokenMap.get('token.debug-token'));
        // Parse TextMate groups from TEMPLATE.jsonc dynamically
        const textmateGroups = this.parseTextMateCategoriesFromFile();
        console.log(`[TextMate] Successfully parsed ${Object.keys(textmateGroups).length} categories with ${Object.values(textmateGroups).flat().length} total tokens`);
        // If parsing failed, fall back to basic categories
        if (Object.keys(textmateGroups).length === 0) {
            textmateGroups['Base Text & Structure'] = ['source', 'support.type.property-name.css'];
            textmateGroups['Punctuation & Delimiters'] = ['punctuation', 'punctuation.terminator', 'punctuation.definition.tag', 'punctuation.separator', 'punctuation.definition.string', 'punctuation.section.block'];
            textmateGroups['Class Definitions'] = ['entity.name.type.class'];
            textmateGroups['Interface Definitions'] = ['entity.name.type.interface', 'entity.name.type'];
            textmateGroups['Struct Definitions'] = ['entity.name.type.struct'];
            textmateGroups['Enum Definitions'] = ['entity.name.type.enum'];
            textmateGroups['Built-in Types'] = ['support.type'];
            textmateGroups['Parameter Types'] = ['variable.type.parameter', 'variable.parameter.type'];
            textmateGroups['Method Definitions'] = ['entity.name.function.method', 'meta.function.method'];
            textmateGroups['Function Names'] = ['entity.name.function', 'support.function', 'meta.function-call.generic'];
            textmateGroups['Function Variables'] = ['variable.function'];
            textmateGroups['Preprocessor Functions'] = ['entity.name.function.preprocessor', 'meta.preprocessor'];
            textmateGroups['Additional Preprocessor'] = ['meta.preprocessor'];
            textmateGroups['Decorators'] = ['meta.decorator', 'punctuation.decorator', 'entity.name.function.decorator'];
            textmateGroups['Variable Names'] = ['variable', 'meta.variable', 'variable.other.object.property', 'variable.other.readwrite.alias'];
            textmateGroups['Object Variables'] = ['variable.other.object'];
            textmateGroups['Global Variables'] = ['variable.other.global', 'variable.language.this'];
            textmateGroups['Local Variables'] = ['variable.other.local'];
            textmateGroups['Function Parameters'] = ['variable.parameter', 'meta.parameter'];
            textmateGroups['Property Access'] = ['variable.other.property', 'meta.property'];
            textmateGroups['Constants & Readonly'] = ['variable.other.constant', 'variable.readonly'];
            textmateGroups['Object Literal Keys'] = ['meta.object-literal.key'];
            textmateGroups['Language Keywords'] = ['keyword'];
            textmateGroups['Import Keywords'] = ['keyword.control.import', 'keyword.control.from', 'keyword.import'];
            textmateGroups['Exception Keywords'] = ['keyword.control.exception', 'keyword.control.trycatch'];
            textmateGroups['Modifiers & Types'] = ['storage.modifier', 'keyword.modifier', 'storage.type'];
            textmateGroups['Operators'] = ['keyword.operator'];
            textmateGroups['String Literals'] = ['string', 'string.other.link', 'markup.inline.raw.string.markdown'];
            textmateGroups['Escape Sequences & Placeholders'] = ['constant.character.escape', 'constant.other.placeholder'];
            textmateGroups['Numeric Literals'] = ['constant.numeric'];
            textmateGroups['Boolean & JSON Constants'] = ['constant.language.boolean', 'constant.language.json'];
            textmateGroups['Labels'] = ['entity.name.label', 'punctuation.definition.label'];
            textmateGroups['Comments'] = ['comment', 'punctuation.definition.comment'];
            textmateGroups['Documentation Comments'] = ['comment.documentation', 'comment.line.documentation'];
            textmateGroups['Namespaces'] = ['entity.name.namespace', 'storage.modifier.namespace', 'markup.bold.markdown'];
            textmateGroups['Modules'] = ['entity.name.module', 'storage.modifier.module'];
            textmateGroups['Underlined Links'] = ['markup.underline.link'];
            textmateGroups['HTML/XML Tag Names'] = ['entity.name.tag'];
            textmateGroups['Component Class Names'] = ['support.class.component'];
            textmateGroups['HTML Attributes & Values'] = ['entity.other.attribute-name', 'meta.attribute'];
            textmateGroups['Information Tokens'] = ['token.info-token'];
            textmateGroups['Warning Tokens'] = ['token.warn-token'];
            textmateGroups['Error Tokens'] = ['token.error-token'];
            textmateGroups['Debug Output Tokens'] = ['token.debug-token'];
        }
        // Add uncategorized TextMate tokens
        const categorizedScopes = new Set(Object.values(textmateGroups).flat());
        const uncategorizedScopes = [];
        tokenMap.forEach((_, scope) => {
            if (!categorizedScopes.has(scope)) {
                uncategorizedScopes.push(scope);
            }
        });
        if (uncategorizedScopes.length > 0) {
            if (!textmateGroups['Other TextMate Tokens']) {
                textmateGroups['Other TextMate Tokens'] = [];
            }
            textmateGroups['Other TextMate Tokens'].push(...uncategorizedScopes);
        }
        let html = '';
        for (const [groupName, scopes] of Object.entries(textmateGroups)) {
            html += `<div class="color-category"><h3 class="category-title">${groupName}</h3><div class="category-content">`;
            scopes.forEach(scope => {
                // Use the token map for faster and more reliable lookup
                const tokenSettings = tokenMap.get(scope);
                let fg = tokenSettings?.foreground;
                // Debug logging for specific problematic tokens
                if (scope === 'token.debug-token') {
                    console.log(`[TextMate Debug] Looking for scope: ${scope}`);
                    console.log(`[TextMate Debug] Found settings:`, tokenSettings);
                    console.log(`[TextMate Debug] Foreground color:`, fg);
                }
                // If no foreground color found, use a default color so the token still appears in UI
                if (typeof fg !== 'string') {
                    fg = '#ffffff'; // Default white color for missing tokens
                }
                const safeValue = this.ensureValidHexColor(fg);
                const description = this.getTextMateTokenDescription(scope);
                // Determine color picker value for TextMate tokens
                const tmPicker = safeValue.length === 9 ? safeValue.slice(0, 7) : safeValue;
                // Compute alpha percentage for transparency slider (0-100)
                const alphaPercent = safeValue.length === 9
                    ? Math.round(parseInt(safeValue.slice(7, 9), 16) / 255 * 100)
                    : 100;
                // Determine special classes for TextMate tokens
                const requiresOpacity = safeValue.length === 9;
                const requiresTransparency = scope.includes('inactive') || scope.includes('muted') || scope.includes('deprecated') || scope.includes('comment.block.documentation');
                const isReadonly = !tokenSettings; // Mark as readonly if no token settings found
                const itemClasses = ['color-item'];
                if (requiresOpacity)
                    itemClasses.push('requires-opacity');
                if (requiresTransparency)
                    itemClasses.push('requires-transparency');
                if (isReadonly)
                    itemClasses.push('textmate-readonly');
                html += `<div class="${itemClasses.join(' ')}" data-search="${scope}">
							<span class="border-indicator"></span>`;
                // Add status badges for TextMate tokens with better tooltips
                const settingName = "editor.tokenColorCustomizations";
                html += `<span class="status-badge setting-name" data-setting="${settingName}" data-tooltip="Click to find: ${settingName}" data-tooltip-class="tooltip-setting-info">${settingName}</span>`;
                if (isReadonly) {
                    html += `<span class="status-badge textmate-readonly" data-tooltip="TextMate syntax token - controlled by language grammar rules" data-tooltip-class="tooltip-textmate-info">📝 Grammar</span>`;
                }
                if (requiresTransparency) {
                    html += `<span class="status-badge transparency-required" data-tooltip="This TextMate token should have transparency for proper visual hierarchy" data-tooltip-class="tooltip-opacity-info">� Needs Alpha</span>`;
                }
                // Removed opacity-required badge (TextMate token) per user request
                html += `<div class="color-info">
							<label class="color-label">
								${scope}
							</label>
							<p class="color-description">${description}</p>
						</div>
						<div class="color-controls">
							<div class="color-inputs-row">
								<input type="color" class="color-picker" name="textmate_${scope}" value="${tmPicker}" />
								<input type="text" class="hex-input" name="textmate_${scope}" value="${safeValue}" pattern="^#[0-9a-fA-F]{6,8}$" />
							</div>
							<div class="color-slider-row">
								<input type="range" class="color-slider${requiresOpacity ? ' opacity-slider' : ''}" min="0" max="100" value="${alphaPercent}" name="alpha_textmate_${scope}" title="Alpha (%)" />
								<span class="slider-value${requiresOpacity ? ' opacity-value' : ''}">${alphaPercent}</span>
							</div>
						</div>  
					</div>`;
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
    generateLegend() {
        return `
			<div class="ui-legend" id="legendPopup">
				<h3>Visual Indicators</h3>
				<div class="legend-grid">
					<div class="legend-item">
						<span class="legend-icon setting-name-demo">workbench.colorCustomizations</span>
						<div class="legend-text">
							<strong>Required Setting</strong><br>
							Click to find the required setting
						</div>
					</div>
					<div class="legend-item">
						<span class="legend-icon">�</span>
						<div class="legend-text">
							<strong>Required Transparency</strong><br>
							MUST have alpha channel to work
						</div>
					</div>
					<div class="legend-item">
						<span class="legend-icon">�️</span>
						<div class="legend-text">
							<strong>Alpha OK</strong><br>
							Supports optional transparency
						</div>
					</div>
					<div class="legend-item">
						<span class="legend-icon">�</span>
						<div class="legend-text">
							<strong>Grammar</strong><br>
							TextMate syntax token
						</div>
					</div>
					<div class="legend-item">
						<span class="legend-icon">🎨</span>
						<div class="legend-text">
							<strong>Preview</strong><br>
							Shows actual UI element/token
						</div>
					</div>
				</div>
			</div>
		`;
    }
    getTooltipForSetting(key) {
        const settingTooltips = {
            'editor.selectionHighlightBackground': 'Requires "editor.selectionHighlight" setting to be enabled',
            'editor.wordHighlightBackground': 'Requires "editor.wordHighlight" setting to be enabled',
            'editor.wordHighlightStrongBackground': 'Requires "editor.wordHighlight" setting to be enabled',
            'editor.findMatchBackground': 'Requires Find widget to be active',
            'editor.findMatchHighlightBackground': 'Requires "editor.findMatchHighlight" setting to be enabled',
            'breadcrumb.background': 'Requires "breadcrumbs.enabled" setting to be enabled',
            'breadcrumb.foreground': 'Requires "breadcrumbs.enabled" setting to be enabled',
            'titleBar.activeBackground': 'Requires "window.titleBarStyle" to be "custom"',
            'titleBar.activeForeground': 'Requires "window.titleBarStyle" to be "custom"',
            'git.decoration.addedResourceForeground': 'Requires Git extension and repository',
            'git.decoration.modifiedResourceForeground': 'Requires Git extension and repository'
        };
        return settingTooltips[key] || `Requires specific settings for ${key}`;
    }
    getNavigationTarget(key) {
        const navigationMap = {
            'editor.selectionHighlightBackground': 'editor.selectionHighlight',
            'editor.wordHighlightBackground': 'editor.wordHighlight',
            'editor.wordHighlightStrongBackground': 'editor.wordHighlight',
            'editor.findMatchHighlightBackground': 'editor.findMatchHighlight',
            'breadcrumb.background': 'breadcrumbs.enabled',
            'breadcrumb.foreground': 'breadcrumbs.enabled',
            'breadcrumb.focusForeground': 'breadcrumbs.enabled',
            'breadcrumb.activeSelectionForeground': 'breadcrumbs.enabled',
            'titleBar.activeBackground': 'window.titleBarStyle',
            'titleBar.activeForeground': 'window.titleBarStyle',
            'titleBar.inactiveBackground': 'window.titleBarStyle',
            'titleBar.inactiveForeground': 'window.titleBarStyle',
            'minimap.background': 'editor.minimap.enabled',
            'minimap.selectionHighlight': 'editor.minimap.enabled',
            'minimap.findMatchHighlight': 'editor.minimap.enabled',
            'peekView.border': 'editor.peekWidgetDefaultFocus',
            'peekViewEditor.background': 'editor.peekWidgetDefaultFocus',
            'peekViewResult.background': 'editor.peekWidgetDefaultFocus',
            'peekViewTitle.background': 'editor.peekWidgetDefaultFocus'
        };
        return navigationMap[key] || key;
    }
    /* Removed - Example visual class mapping no longer needed since preview boxes were removed
    private getExampleVisualClass(key: string): string {
        // Map specific workbench colors to appropriate UI element previews
        const elementMap: Record<string, string> = {
            // Editor
            'editor.background': 'editor-bg',
            'editor.foreground': 'text-color',
            'editor.selectionBackground': 'selection-bg',
            'editor.selectionForeground': 'text-color',
            'editor.lineHighlightBackground': 'editor-bg',
            'editor.findMatchBackground': 'selection-bg',
            
            // Sidebar/Explorer
            'sideBar.background': 'sidebar-bg',
            'sideBar.foreground': 'text-color',
            'sideBar.border': 'border-style',
            
            // Activity Bar
            'activityBar.background': 'activity-bar-bg',
            'activityBar.foreground': 'text-color',
            'activityBar.border': 'border-style',
            
            // Status Bar
            'statusBar.background': 'statusbar-bg',
            'statusBar.foreground': 'text-color',
            'statusBar.border': 'border-style',
            
            // Tabs
            'tab.activeBackground': 'tab-bg',
            'tab.activeForeground': 'text-color',
            'tab.inactiveBackground': 'tab-bg',
            'tab.border': 'border-style',
            
            // Panel
            'panel.background': 'panel-bg',
            'panel.foreground': 'text-color',
            'panel.border': 'border-style',
            
            // Buttons
            'button.background': 'button-bg',
            'button.foreground': 'text-color',
            'button.hoverBackground': 'button-bg',
            
            // Input
            'input.background': 'input-bg',
            'input.foreground': 'text-color',
            'input.border': 'border-style',
            
            // Scrollbar
            'scrollbar.shadow': 'scrollbar-bg',
            'scrollbarSlider.background': 'scrollbar-bg',
            'scrollbarSlider.hoverBackground': 'scrollbar-bg'
        };
        
        // Return specific mapping if found
        if (elementMap[key]) {
            return elementMap[key];
        }
        
        // Fallback to pattern matching
        if (key.includes('background') || key.includes('Background')) {
            if (key.includes('editor')) return 'editor-bg';
            if (key.includes('sideBar') || key.includes('sidebar')) return 'sidebar-bg';
            if (key.includes('statusBar') || key.includes('status')) return 'statusbar-bg';
            if (key.includes('activityBar') || key.includes('activity')) return 'activity-bar-bg';
            if (key.includes('tab')) return 'tab-bg';
            if (key.includes('panel')) return 'panel-bg';
            if (key.includes('button')) return 'button-bg';
            if (key.includes('input')) return 'input-bg';
            if (key.includes('scrollbar')) return 'scrollbar-bg';
            return 'editor-bg';
        }
        if (key.includes('foreground') || key.includes('Foreground')) {
            return 'text-color';
        }
        if (key.includes('border') || key.includes('Border')) {
            return 'border-style';
        }
        if (key.includes('selection') || key.includes('Selection')) {
            return 'selection-bg';
        }
        return 'editor-bg';
    }
    */
    requiresTransparency(key) {
        // Colors that REQUIRE transparency to work properly
        const transparencyRequired = [
            'editor.selectionHighlightBackground',
            'editor.wordHighlightBackground',
            'editor.wordHighlightStrongBackground',
            'editor.rangeHighlightBackground',
            'editor.findMatchHighlightBackground',
            'editor.hoverHighlightBackground',
            'editor.lineHighlightBackground',
            'list.dropBackground',
            'editor.inactiveSelectionBackground',
            'selection.background',
            'widget.shadow',
            'scrollbar.shadow'
        ];
        return transparencyRequired.includes(key);
    }
    requiresSpecificSetting(key) {
        const settingDependentKeys = [
            'editor.selectionHighlightBackground',
            'editor.wordHighlightBackground',
            'editor.wordHighlightStrongBackground',
            'editor.findMatchHighlightBackground',
            'breadcrumb.background',
            'breadcrumb.foreground',
            'breadcrumb.focusForeground',
            'breadcrumb.activeSelectionForeground',
            'titleBar.activeBackground',
            'titleBar.activeForeground',
            'titleBar.inactiveBackground',
            'titleBar.inactiveForeground',
            'minimap.background',
            'minimap.selectionHighlight',
            'minimap.findMatchHighlight',
            'peekView.border',
            'peekViewEditor.background',
            'peekViewResult.background',
            'peekViewTitle.background'
        ];
        return settingDependentKeys.includes(key);
    }
    getTextMateTokenExample(scope) {
        const examples = {
            'keyword': 'if',
            'keyword.control': 'if',
            'keyword.operator': '===',
            'storage.type': 'class',
            'storage.modifier': 'public',
            'entity.name.function': 'func',
            'entity.name.class': 'User',
            'entity.name.type': 'String',
            'variable': 'user',
            'variable.parameter': 'name',
            'string': '"abc"',
            'string.quoted': '"text"',
            'constant.numeric': '123',
            'constant.language': 'true',
            'comment': '// ...',
            'comment.line': '// ...',
            'comment.block': '/* */',
            'punctuation': '{}',
            'punctuation.definition': '{}',
            'operator': '+',
            'support.function': 'log',
            'support.class': 'Array',
            'meta.function': 'fn',
            'meta.class': 'class',
            'markup.heading': '# H1',
            'markup.bold': '**bold**',
            'markup.italic': '*italic*',
            'invalid': 'error',
            'invalid.illegal': 'err'
        };
        // Try exact match first
        if (examples[scope])
            return examples[scope];
        // Try partial matches for scopes with dots
        const parts = scope.split('.');
        for (let i = parts.length - 1; i >= 0; i--) {
            const partialScope = parts.slice(0, i + 1).join('.');
            if (examples[partialScope])
                return examples[partialScope];
        }
        // Fallback based on scope name patterns
        if (scope.includes('string'))
            return '"..."';
        if (scope.includes('number'))
            return '123';
        if (scope.includes('comment'))
            return '//';
        if (scope.includes('keyword'))
            return 'key';
        if (scope.includes('function'))
            return 'fn';
        if (scope.includes('class'))
            return 'Cls';
        if (scope.includes('variable'))
            return 'var';
        if (scope.includes('type'))
            return 'Type';
        if (scope.includes('operator'))
            return '+';
        if (scope.includes('punctuation'))
            return '()';
        // Final fallback
        return 'Abc';
    }
    getSemanticTokenExample(key) {
        const examples = {
            // Language constructs
            'keyword': 'if',
            'keyword.control': 'for',
            'function': 'fn()',
            'function.declaration': 'func',
            'method': 'get()',
            'variable': 'user',
            'variable.parameter': 'name',
            'parameter': 'arg',
            'type': 'String',
            'class': 'User',
            'interface': 'IUser',
            'struct': 'Point',
            'enum': 'Color',
            'enumMember': 'RED',
            'property': 'name',
            'string': '"text"',
            'number': '123',
            'boolean': 'true',
            'comment': '// ...',
            'operator': '+',
            'punctuation': '{}',
            'namespace': 'std',
            'module': 'fs',
            'label': 'loop:',
            'decorator': '@Override',
            'macro': '#define',
            'generic': '<T>',
            'lifetime': "'a"
        };
        // Try exact match
        if (examples[key])
            return examples[key];
        // Try partial matches
        const parts = key.split('.');
        for (let i = parts.length - 1; i >= 0; i--) {
            const partialKey = parts.slice(0, i + 1).join('.');
            if (examples[partialKey])
                return examples[partialKey];
        }
        // Pattern-based fallbacks
        if (key.includes('function'))
            return 'fn()';
        if (key.includes('class'))
            return 'Class';
        if (key.includes('variable'))
            return 'var';
        if (key.includes('string'))
            return '"..."';
        if (key.includes('number'))
            return '42';
        if (key.includes('keyword'))
            return 'key';
        if (key.includes('type'))
            return 'Type';
        return key.charAt(0).toUpperCase();
    }
    /**
     * Handle opening a specific VS Code setting
     */
    async handleOpenSetting(settingName) {
        try {
            // Open VS Code settings UI with search for the specific setting
            await vscode.commands.executeCommand('workbench.action.openSettings', settingName);
            // Show notification to user
            vscode.window.showInformationMessage(`Opened VS Code settings for: ${settingName}`);
        }
        catch (error) {
            console.error(`Failed to open setting ${settingName}:`, error);
            vscode.window.showErrorMessage(`Failed to open setting: ${settingName}`);
        }
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