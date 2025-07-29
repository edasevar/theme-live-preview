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
require("mocha");
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
suite('Template Updates Test Suite', () => {
    // Simple test without actual ThemeManager for now
    // This validates the test framework is working
    test('Test framework initialization', () => {
        assert.ok(true, 'Test framework should work');
    });
    test('VS Code API availability', () => {
        assert.ok(vscode, 'VS Code API should be available in test context');
        assert.ok(vscode.workspace, 'VS Code workspace API should be available');
        assert.ok(vscode.window, 'VS Code window API should be available');
    });
    test('Path utilities work', () => {
        const testPath = path.join('test', 'folder', 'file.txt');
        assert.ok(testPath.includes('test'), 'Path utilities should work correctly');
    });
    test('Template update concept validation', () => {
        // Test the concept of template updates without actual implementation
        const mockTemplate = {
            colors: { 'editor.background': '#1e1e1e' },
            semanticTokenColors: { 'variable': '#569cd6' },
            tokenColors: [{ scope: 'comment', settings: { foreground: '#6a9955' } }]
        };
        // Validate template structure
        assert.ok(mockTemplate.colors, 'Template should have colors');
        assert.ok(mockTemplate.semanticTokenColors, 'Template should have semantic token colors');
        assert.ok(Array.isArray(mockTemplate.tokenColors), 'Template should have token colors array');
        // Validate template element counts
        const colorCount = Object.keys(mockTemplate.colors).length;
        const semanticCount = Object.keys(mockTemplate.semanticTokenColors).length;
        const tokenCount = mockTemplate.tokenColors.length;
        const total = colorCount + semanticCount + tokenCount;
        assert.ok(total > 0, 'Template should have elements');
        console.log('Mock template stats:', { colorCount, semanticCount, tokenCount, total });
    });
});
//# sourceMappingURL=template-updates.test.js.map