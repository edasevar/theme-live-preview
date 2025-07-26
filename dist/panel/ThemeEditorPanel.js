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
const jsonc_parser_1 = require("jsonc-parser");
class ThemeEditorPanel {
    static createOrShow(extensionUri) {
        const column = vscode.ViewColumn.Beside;
        if (ThemeEditorPanel.currentPanel) {
            ThemeEditorPanel.currentPanel.panel.reveal(column);
            return;
        }
        const panel = vscode.window.createWebviewPanel('themeEditor', 'Theme Editor Live', column, { enableScripts: true });
        ThemeEditorPanel.currentPanel = new ThemeEditorPanel(panel, extensionUri);
    }
    constructor(panel, extensionUri) {
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.panel.webview.html = this.getHtml();
        this.panel.onDidDispose(() => {
            ThemeEditorPanel.currentPanel = undefined;
        });
        this.panel.webview.onDidReceiveMessage((message) => {
            if (message.type === 'liveUpdate') {
                this.applyLiveColor(message.key, message.value);
            }
        });
    }
    applyLiveColor(key, value) {
        const config = vscode.workspace.getConfiguration();
        // Check for TextMate entry (which can't be live updated)
        if (key.startsWith("token_"))
            return;
        const currentCustom = config.get('workbench.colorCustomizations') || {};
        currentCustom[key] = value;
        config.update('workbench.colorCustomizations', currentCustom, vscode.ConfigurationTarget.Global);
    }
    getHtml() {
        const templatePath = path.join(this.extensionUri.fsPath, 'TEMPLATE.jsonc');
        const content = fs.readFileSync(templatePath, 'utf8');
        const template = (0, jsonc_parser_1.parse)(content);
        const renderColorInputs = (title, obj) => {
            if (!obj || typeof obj !== 'object')
                return '';
            const inputs = Object.entries(obj)
                .map(([key, value]) => {
                const safeValue = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value) ? value : '#ffffff';
                return `<label>${key}: <input type="color" name="${key}" value="${safeValue}"></label><br>`;
            }).join('\n');
            return `<h3>${title}</h3>${inputs}`;
        };
        const renderTokenColors = (tokenArray) => {
            if (!Array.isArray(tokenArray))
                return '';
            const inputs = tokenArray.map((token, i) => {
                if (!token.scope || !token.settings || !token.settings.foreground)
                    return '';
                const scope = Array.isArray(token.scope) ? token.scope.join(', ') : token.scope;
                const value = token.settings.foreground;
                const safeValue = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(value) ? value : '#ffffff';
                return `<label>TextMate: ${scope}<input type="color" name="token_${i}" value="${safeValue}"></label><br>`;
            }).join('\n');
            return `<h3>TextMate Token Colors</h3>${inputs}`;
        };
        const sectionColors = renderColorInputs('Workbench Colors', template.colors);
        const sectionSemantic = renderColorInputs('Semantic Token Colors', template.semanticTokenColors);
        const sectionTokens = renderTokenColors(template.tokenColors || []);
        const scriptUri = vscode.Uri.file(path.join(this.extensionUri.fsPath, 'media', 'editor-ui.js')).with({ scheme: 'vscode-resource' });
        const styleUri = vscode.Uri.file(path.join(this.extensionUri.fsPath, 'media', 'style.css')).with({ scheme: 'vscode-resource' });
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width" />
  <link rel="stylesheet" href="${styleUri}">
  <title>Theme Editor</title>
</head>
<body>
  <h2>Theme Editor Live</h2>
  <form id="themeForm">
    ${sectionColors}
    ${sectionSemantic}
    ${sectionTokens}
    <button type="submit">Apply</button>
  </form>
  <script src="${scriptUri}"></script>
</body>
</html>`;
    }
}
exports.ThemeEditorPanel = ThemeEditorPanel;
//# sourceMappingURL=ThemeEditorPanel.js.map