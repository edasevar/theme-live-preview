import * as vscode from 'vscode';

export class ThemeEditorTreeProvider implements vscode.TreeDataProvider<ThemeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ThemeItem | undefined | null | void> = new vscode.EventEmitter<ThemeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ThemeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private context: vscode.ExtensionContext) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ThemeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: ThemeItem): Thenable<ThemeItem[]> {
        if (!element) {
            // Root level items with enhanced editing capabilities
            return Promise.resolve([
                new ThemeItem(
                    '🎨 Open Theme Editor',
                    'Launch the visual theme editor with real-time preview',
                    vscode.TreeItemCollapsibleState.None,
                    'themeEditor.open',
                    'paintbrush'
                ),
                new ThemeItem(
                    '🎨 Quick Colors',
                    'Edit commonly used colors directly from sidebar',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    'symbol-color'
                ),
                new ThemeItem(
                    '🔤 Syntax Colors',
                    'Edit code syntax highlighting colors',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    'symbol-keyword'
                ),
                new ThemeItem(
                    '� Template Management',
                    'Manage and sync your theme templates',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    'file-directory'
                ),
                new ThemeItem(
                    '⚙️ Settings & Tools',
                    'Theme settings, cleanup, and maintenance tools',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    'tools'
                ),
                new ThemeItem(
                    '📊 Theme Statistics',
                    'View detailed theme information and statistics',
                    vscode.TreeItemCollapsibleState.None,
                    'themeEditor.templateStats',
                    'graph-line'
                ),
                new ThemeItem(
                    '🚀 Quick Actions',
                    'Frequently used theme operations',
                    vscode.TreeItemCollapsibleState.Collapsed,
                    undefined,
                    'rocket'
                )
            ]);
        } else {
            // Child items based on parent with better organization
            if (element.label === '� Template Management') {
                return Promise.resolve([
                    new ThemeItem(
                        '🔄 Reload Template',
                        'Reload theme elements from TEMPLATE.jsonc file',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.reloadTemplate',
                        'refresh'
                    ),
                    new ThemeItem(
                        '🔗 Sync Template',
                        'Synchronize template with current UI settings',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.syncTemplate',
                        'sync'
                    )
                ]);
            } else if (element.label === '⚙️ Settings & Tools') {
                return Promise.resolve([
                    new ThemeItem(
                        '🧹 Clean Up Settings',
                        'Remove unused and legacy theme settings',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.cleanupSettings',
                        'trash'
                    ),
                    new ThemeItem(
                        '🔄 Refresh Webview',
                        'Refresh the theme editor interface',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.refreshWebview',
                        'browser'
                    )
                ]);
            } else if (element.label === '🎨 Quick Colors') {
                return Promise.resolve([
                    new ThemeItem(
                        '🔴 Errors',
                        'Color for error messages and indicators',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'error',
                        'workbench',
                        'errorForeground'
                    ),
                    new ThemeItem(
                        '⚠️ Warnings',
                        'Color for warning messages and indicators',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'warning',
                        'workbench',
                        'warningForeground'
                    ),
                    new ThemeItem(
                        'ℹ️ Info Messages',
                        'Color for information messages',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'info',
                        'workbench',
                        'infoForeground'
                    ),
                    new ThemeItem(
                        '🎯 Focus Border',
                        'Border color for focused elements',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'target',
                        'workbench',
                        'focusBorder'
                    ),
                    new ThemeItem(
                        '🔗 Links',
                        'Color for clickable links',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'link',
                        'workbench',
                        'textLinkForeground'
                    ),
                    new ThemeItem(
                        '✅ Success',
                        'Color for success messages and indicators',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'check',
                        'workbench',
                        'successForeground'
                    )
                ]);
            } else if (element.label === '🔤 Syntax Colors') {
                return Promise.resolve([
                    new ThemeItem(
                        '💬 Comments',
                        'Color for code comments',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'comment',
                        'syntax',
                        'comment'
                    ),
                    new ThemeItem(
                        '🔤 Keywords',
                        'Color for language keywords (if, else, function)',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'key',
                        'syntax',
                        'keyword'
                    ),
                    new ThemeItem(
                        '📝 Strings',
                        'Color for string literals',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'quote',
                        'syntax',
                        'string'
                    ),
                    new ThemeItem(
                        '🔢 Numbers',
                        'Color for numeric literals',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'symbol-numeric',
                        'syntax',
                        'number'
                    ),
                    new ThemeItem(
                        '🏷️ Variables',
                        'Color for variable names',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'symbol-variable',
                        'syntax',
                        'variable'
                    ),
                    new ThemeItem(
                        '⚡ Functions',
                        'Color for function names',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.editColor',
                        'symbol-function',
                        'syntax',
                        'function'
                    )
                ]);
            } else if (element.label === '🚀 Quick Actions') {
                return Promise.resolve([
                    new ThemeItem(
                        '⚡ Launch Editor',
                        'Quick launch theme editor',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.open',
                        'zap'
                    ),
                    new ThemeItem(
                        '📈 View Stats',
                        'Quick view of theme statistics',
                        vscode.TreeItemCollapsibleState.None,
                        'themeEditor.templateStats',
                        'pulse'
                    )
                ]);
            }
        }
        return Promise.resolve([]);
    }
}

export class ThemeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly tooltip: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId?: string,
        public readonly iconName?: string,
        public readonly colorType?: string,
        public readonly colorKey?: string
    ) {
        super(label, collapsibleState);
        
        this.tooltip = tooltip;
        
        if (commandId) {
            this.command = {
                command: commandId,
                title: label,
                arguments: [colorType, colorKey]
            };
        }

        // Set contextValue for different item types
        if (commandId === 'themeEditor.open') {
            this.contextValue = 'themeEditorMain';
        } else if (commandId === 'themeEditor.editColor') {
            this.contextValue = 'themeColorEditor';
        } else if (collapsibleState === vscode.TreeItemCollapsibleState.Collapsed) {
            this.contextValue = 'themeEditorCategory';
        } else {
            this.contextValue = 'themeEditorAction';
        }

        // Set icons using built-in VS Code icons
        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName);
        }
    }
}
