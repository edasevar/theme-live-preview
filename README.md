# Theme Editor Live

A comprehensive VS Code extension for creating and editing themes with real-time preview. This extension provides a visual interface to customize every aspect of VS Code's appearance, including workbench colors, semantic tokens, and TextMate token colors.

## ✨ Features

### 🚀 Enhanced Live Editing Capabilities (New!)
- **Throttled Updates**: Color changes are batched and throttled (150ms) to prevent overwhelming VS Code
- **Batch Processing**: Multiple simultaneous changes are processed efficiently in batches
- **Debounced Search**: Search input is debounced (200ms) for smoother filtering experience
- **Smart Validation**: Real-time color validation with immediate visual feedback
- **Preview Mode**: Test colors before applying them permanently
- **Visual Feedback**: Success/error notifications for all operations with smooth animations
- **Change Listeners**: Extensible system for theme change notifications
- **Memory Efficient**: Optimized batching prevents memory leaks during intensive editing

### 🎨 Complete Theme Coverage
- **Workbench UI Colors**: Edit all VS Code interface colors including editor, activity bar, sidebar, status bar, and more
- **Semantic Token Colors**: Customize syntax highlighting for different code elements (classes, functions, variables, etc.)
- **TextMate Token Colors**: Fine-tune syntax highlighting with granular scope-based control

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
- Load existing themes from JSON/JSONC files
- Load empty themes with `#ffffff` and `#ffffff00` values
- Export your custom themes as JSON files
- Import and modify any VS Code theme
- Future support for .vsix and .css files

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
| `Theme Editor: Load Theme File` | Load a theme from JSON, JSONC, VSIX, or CSS file |
| `Theme Editor: Export Current Theme` | Export your current theme customizations |
| `Theme Editor: Reset Theme to Default` | Reset all customizations to default |

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
Fine-grained syntax highlighting control:
- **Scopes**: Detailed token scoping rules
- **Language-Specific**: Support for all programming languages
- **Markup**: HTML, Markdown, XML styling
- **Debug Tokens**: Special debugging information

## 🔍 Advanced Features

### Search & Navigation
- **Quick Search**: Find any color property instantly
- **Categorized View**: Colors organized by UI component
- **Section Navigation**: Easy switching between theme areas
- **Result Counting**: See how many items match your search

### Theme Management
- **Multiple Formats**: Support for JSON, JSONC files (VSIX and CSS coming soon)
- **Empty Themes**: Start with blank templates using `#ffffff` and transparent colors
- **Export Options**: Save your themes for sharing or backup
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
2. Click "Load Empty Theme" for a clean start
3. Navigate to "Workbench UI" section
4. Set `editor.background` to `#1e1e1e`
5. Set `editor.foreground` to `#d4d4d4`
6. Continue customizing other elements
7. Export when satisfied

### Customizing Syntax Highlighting
1. Go to "Semantic Tokens" section
2. Set `keyword` to your preferred color (e.g., `#569cd6`)
3. Set `string` to a contrasting color (e.g., `#ce9178`)
4. Adjust `comment` for readability (e.g., `#6a9955`)
5. See changes in the live preview

### Loading an Existing Theme
1. Click "Load Theme File"
2. Select your JSON/JSONC theme file
3. Colors will populate in the editor
4. Make modifications as needed
5. Export your enhanced version

## 🎨 Color Format Support

- **Hex Colors**: `#ffffff`, `#fff`
- **Hex with Alpha**: `#ffffff00` (transparent), `#ffffffcc` (semi-transparent)
- **Auto-validation**: Invalid colors are highlighted
- **Color Picker**: Visual color selection
- **Synchronized Inputs**: Color picker and hex input stay in sync

## 🔧 Technical Details

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
- **Main Extension**: Registers commands and manages lifecycle
- **Theme Manager**: Handles theme operations (load, save, apply)
- **Webview Panel**: Provides the visual editor interface
- **Live Preview**: Real-time VS Code theme updates

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
