# Theme Editor Live

A comprehensive VS Code extension for creating and editing themes with real-time preview and transparency controls. This extension provides a visual interface to customize every aspect of VS Code's appearance, including workbench colors, semantic tokens, and TextMate token colors with full alpha channel support.

## ✨ Features

### 🚀 Enhanced Live Editing Capabilities
- **Throttled Updates**: Color changes are batched and throttled (150ms) to prevent overwhelming VS Code
- **Batch Processing**: Multiple simultaneous changes are processed efficiently in batches
- **Debounced Search**: Search input is debounced (200ms) for smoother filtering experience
- **Smart Validation**: Real-time color validation with immediate visual feedback
- **Preview Mode**: Test colors before applying them permanently
- **Visual Feedback**: Success/error notifications for all operations with smooth animations
- **Change Listeners**: Extensible system for theme change notifications
- **Memory Efficient**: Optimized batching prevents memory leaks during intensive editing

### 🎨 Transparency & Alpha Controls (New!)
- **Full Alpha Channel Support**: 8-digit hex colors with transparency (#RRGGBBAA)
- **Visual Alpha Controls**: Intuitive opacity sliders for all color values
- **Percentage-Based Alpha**: Easy-to-understand 0-100% opacity controls
- **Real-time Sync**: Color picker, hex input, and alpha controls stay synchronized
- **Transparent Defaults**: Support for fully transparent colors in theme templates

### 🎨 Complete Theme Coverage
- **Workbench UI Colors**: Edit all VS Code interface colors including editor, activity bar, sidebar, status bar, and more (200+ elements)
- **Semantic Token Colors**: Customize syntax highlighting for different code elements with style modifiers
- **TextMate Token Colors**: Fine-tune syntax highlighting with granular scope-based control and complete token coverage

### 🛠 Smart Settings Management (New!)
- **Proper Routing**: Colors are correctly routed to appropriate VS Code settings sections
- **Legacy Cleanup**: Automatic detection and cleanup of incorrectly placed settings
- **Type Safety**: Full TypeScript implementation with proper interface definitions
- **Settings Validation**: Real-time validation of all theme configurations

### 🔄 Live Preview
- Real-time theme application as you make changes
- Instant visual feedback for all color modifications
- No need to reload VS Code to see changes

### 🛠 User-Friendly Interface
- Organized sections for different UI components
- Color picker integration for easy color selection
- Search functionality to quickly find specific theme properties
- Visual color previews for all theme elements
- Categorized color groups for better organization

### 📁 Theme Management
- **Load Current Theme**: Import your existing VS Code theme settings
- **Load Empty Theme**: Start with clean white theme using `#ffffff` and `#ffffff00` (transparent) values
- **Export Custom Themes**: Save your themes as JSON files for sharing or backup
- **Reset to Default**: Clear all customizations and restore original settings
- **Legacy Settings Cleanup**: Automatic cleanup of duplicate or incorrectly placed theme settings
- **Multiple Format Support**: JSON/JSONC theme files (with future support for .vsix and .css files)

## 🚀 Getting Started

### Installation
1. Install the extension from the VS Code marketplace (or package and install the .vsix file)
2. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
3. Run the command `Theme Editor: Open Theme Editor Live`

### Basic Usage
1. **Open the Theme Editor**: Use the command palette or click the extension icon
2. **Navigate Sections**: Use the sidebar to switch between Workbench UI, Semantic Tokens, and TextMate Tokens
3. **Edit Colors**: Click on color boxes or type hex values directly
4. **Search**: Use the search bar to quickly find specific color properties
5. **Preview**: See changes applied instantly to VS Code and in the preview panel

## 📋 Commands

| Command | Description |
|---------|-------------|
| `Theme Editor: Open Theme Editor Live` | Opens the main theme editor interface |
| `Theme Editor: Load Current Theme` | Load your current VS Code theme settings |
| `Theme Editor: Load Empty Theme` | Start with a clean white theme template |
| `Theme Editor: Export Current Theme` | Export your current theme customizations as JSON |
| `Theme Editor: Reset Theme to Default` | Reset all customizations to default settings |
| `Theme Editor: Cleanup Legacy Settings` | Clean up duplicate or incorrectly placed theme settings |

## 🎯 Theme Components

### Workbench UI Colors
Comprehensive coverage of VS Code's interface elements:

#### Editor Core
- **Background & Foreground**: Main editor colors
- **Selection & Highlighting**: Text selection, word highlights, search results
- **Cursor & Whitespace**: Cursor color, visible whitespace
- **Line Numbers**: Gutter line numbers and active line highlighting

#### Editor Widgets & Popups
- **Autocomplete**: Suggestion dropdown styling
- **Hover Tooltips**: Symbol information popups
- **Error Indicators**: Squiggly underlines for errors, warnings, info

#### Activity Bar & Sidebar
- **Activity Bar**: Left sidebar with extension icons
- **File Explorer**: Tree view, file icons, folders
- **Section Headers**: Collapsible sections

#### Status Bar & Terminal
- **Status Information**: Bottom status bar
- **Terminal Colors**: All 16 ANSI colors plus cursor and selection
- **Debug States**: Special coloring during debugging

#### Advanced UI Elements
- **Tabs & Groups**: Editor tab styling and grouping
- **Panels**: Terminal, output, debug console
- **Notifications**: Toast messages and alerts
- **Peek View**: Definition and reference previews

### Semantic Token Colors
Modern syntax highlighting based on language understanding:
- **Types**: Classes, interfaces, enums, structs
- **Variables**: Local variables, parameters, properties
- **Functions**: Method calls, function definitions
- **Keywords**: Language constructs and modifiers
- **Literals**: Strings, numbers, booleans
- **Comments**: Single-line and block comments

### TextMate Token Colors
Fine-grained syntax highlighting control with complete scope coverage:
- **Language Constructs**: Classes, functions, variables, keywords, operators
- **Literals**: Strings, numbers, booleans, constants, escape characters
- **Comments**: Single-line and block comments, documentation
- **Markup**: HTML, Markdown, XML styling and attributes
- **Debug Tokens**: Special debugging information and placeholders
- **Namespaces**: Modules, object keys, and label definitions
- **All Missing Tokens**: Previously missing tokens like `entity.name.type`, `support.type`, `entity.name.function`, `support.function`, `variable.other.constant`, `meta.object-literal.key`, `constant.character.escape`, `constant.other.placeholder`, `entity.name.label`, `entity.name.namespace` are now fully supported

## 🔍 Advanced Features

### Search & Navigation
- **Quick Search**: Find any color property instantly
- **Categorized View**: Colors organized by UI component
- **Section Navigation**: Easy switching between theme areas
- **Result Counting**: See how many items match your search

### Theme Management
- **Multiple Formats**: Support for JSON, JSONC files (VSIX and CSS coming soon)
- **Current Theme Import**: Load your existing VS Code theme settings directly
- **Empty Themes**: Start with blank templates using `#ffffff` and fully transparent colors (`#ffffff00`)
- **Export Options**: Save your themes for sharing or backup with complete token coverage
- **Legacy Cleanup**: Automatic detection and removal of duplicate/incorrectly placed settings
- **Live Application**: See changes immediately without restarts

### User Experience
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + F`: Focus search
  - `Ctrl/Cmd + R`: Reset colors
  - `Ctrl/Cmd + E`: Export theme
- **Visual Feedback**: Color change animations and notifications
- **Responsive Design**: Works on different screen sizes
- **Accessibility**: Full keyboard navigation support

## 📖 Usage Examples

### Creating a Dark Theme
1. Open Theme Editor Live
2. Click "Load Empty Theme" for a clean start with transparent defaults
3. Navigate to "Workbench UI" section
4. Set `editor.background` to `#1e1e1e`
5. Set `editor.foreground` to `#d4d4d4`
6. Adjust transparency using the alpha slider for subtle effects
7. Continue customizing other elements with full TextMate token support
8. Export when satisfied with your theme

### Customizing Syntax Highlighting
1. Go to "Semantic Tokens" section for modern language-aware highlighting
2. Set `keyword` to your preferred color (e.g., `#569cd6`)
3. Set `string` to a contrasting color (e.g., `#ce9178`)
4. Adjust `comment` for readability (e.g., `#6a9955`)
5. Switch to "TextMate Tokens" for fine-grained control
6. Customize specific scopes like `entity.name.function` or `support.type`
7. See changes in the live preview instantly

### Loading Your Current Theme
1. Click "Load Current Theme" to import existing settings
2. All your current customizations will populate in the editor
3. Missing tokens will be displayed with default values
4. Make modifications using the visual interface
5. Export your enhanced version with complete coverage

## 🎨 Color Format Support

- **Hex Colors**: `#ffffff`, `#fff` (3 and 6 digit formats)
- **Hex with Alpha**: `#ffffff00` (transparent), `#ffffffcc` (semi-transparent), `#ffff` (4-digit with alpha)
- **Alpha Controls**: Visual opacity sliders with percentage display (0-100%)
- **Auto-validation**: Invalid colors are highlighted with immediate feedback
- **Color Picker**: Visual color selection with transparency support
- **Synchronized Inputs**: Color picker, hex input, and alpha controls stay perfectly synchronized
- **Transparent Defaults**: Full support for transparent colors in theme templates

## 🔧 Technical Details

### Recent Improvements (v1.0.0)
- **Fixed TextMate Token Routing**: Resolved issues where TextMate tokens weren't properly routing to `editor.tokenColorCustomizations`
- **Complete Token Coverage**: All missing TextMate tokens now display in the UI with proper default values
- **Settings Management**: Improved routing logic to ensure colors go to correct VS Code settings sections
- **TypeScript Interfaces**: Fixed interface definitions for proper type safety and settings handling
- **Legacy Cleanup**: Added automatic cleanup of duplicate settings and legacy configurations

### File Structure
```
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── panel/
│   │   └── ThemeEditorPanel.ts   # Webview panel implementation
│   └── utils/
│       └── themeManager.ts       # Theme loading/saving logic
├── media/
│   ├── editor-ui.js          # Frontend JavaScript
│   └── style.css             # UI styling
├── themes/
│   └── empty-theme.json      # Empty theme template
└── TEMPLATE.jsonc            # Complete theme structure reference
```

### Extension Architecture
- **Main Extension**: Registers commands and manages lifecycle with proper cleanup
- **Theme Manager**: Handles theme operations (load, save, apply) with smart settings routing
- **Webview Panel**: Provides the visual editor interface with transparency controls
- **Live Preview**: Real-time VS Code theme updates with proper token routing
- **Settings Integration**: Direct VS Code configuration API with legacy cleanup support

## 🐛 Known Issues Fixed

### v1.0.0 Fixes
- ✅ **TextMate Token Visibility**: Fixed missing tokens like `entity.name.type`, `support.type`, `entity.name.function` not appearing in UI
- ✅ **Settings Routing**: Corrected improper routing of semantic and TextMate tokens to wrong settings sections  
- ✅ **Type Safety**: Resolved TypeScript interface inconsistencies that caused settings errors
- ✅ **Empty Theme Loading**: Repaired broken empty theme functionality with complete token coverage
- ✅ **Alpha Channel Support**: Implemented proper transparency handling across all color inputs
- ✅ **Legacy Settings**: Added automatic cleanup of duplicate/incorrectly placed theme configurations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup
1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press `F5` to launch extension development host
5. Use `npm run compile` to build
6. Use `npm run watch` for continuous compilation

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- VS Code team for the excellent theming system
- Community theme creators for inspiration
- All contributors and users providing feedback

---

**Happy Theming! 🎨**
