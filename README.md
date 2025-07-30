# Theme Editor Live

A comprehensive VS Code extension for creating and editing themes with real-time preview, transparency controls, and an integrated sidebar interface. This extension provides a visual interface to customize every aspect of VS Code's appearance, including workbench colors, semantic tokens, and TextMate token colors with full alpha channel support.

## ✨ Features

### 🎨 **NEW: Direct Sidebar Editing (v3.2.0)**
- **📍 Activity Bar Icon**: Dedicated Theme Editor Live icon in the activity bar for one-click access.
- **🏗️ Organized Sidebar**: Custom sidebar panel with an intuitive tree structure and categorized actions.
- **🎨 Direct Color Editing**: Edit colors instantly from the sidebar without opening the main editor:
  - **🎨 Quick Colors**: Instantly edit errors (🔴), warnings (⚠️), info messages (ℹ️), focus borders (🎯), links (🔗), and success indicators (✅).
  - **🔤 Syntax Colors**: Modify code highlighting for comments (💬), keywords (🔤), strings (📝), numbers (🔢), variables (🏷️), and functions (⚡).
- **⚡ One-Click Color Picker**: Click any color item to open VS Code's native color picker for immediate changes.
- **🔄 Real-time Updates**: See changes applied instantly to your VS Code interface.
- **�️ Reliable Saving**: Uses a robust "nuclear" update mechanism to ensure all color changes, including those with transparency, are reliably saved to your `settings.json`.

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
- **Workbench UI Colors**: Edit all VS Code interface colors including editor, activity bar, sidebar, status bar, and more (800+ elements)
- **Semantic Token Colors**: Customize syntax highlighting for different code elements with style modifiers
- **TextMate Token Colors**: Fine-tune syntax highlighting with granular scope-based control and complete token coverage
  - **📂 Smart Categorization (v2.1.0)**: TextMate tokens are now organized into 48 meaningful categories instead of a generic "Other" section
  - **🎯 Logical Groupings**: Tokens grouped by functionality (Language Keywords, Function Names, Class Definitions, etc.)
  - **📊 Complete Coverage**: 122+ TextMate token scopes properly categorized from TEMPLATE.jsonc
  - **🔍 Enhanced Discovery**: Find specific tokens faster with descriptive category names

### 🛠 Smart Settings Management (New!)
- **Proper Routing**: Colors are correctly routed to appropriate VS Code settings sections
- **Legacy Cleanup**: Automatic detection and cleanup of incorrectly placed settings
- **Type Safety**: Full TypeScript implementation with proper interface definitions
- **Settings Validation**: Real-time validation of all theme configurations

### 🚀 Nuclear-Powered Reliability (v1.1.0)
- **100% Settings Updates**: Revolutionary "nuclear option" ensures ALL color changes persist to VS Code settings
- **Direct File Manipulation**: Bypasses VS Code's unreliable API using direct settings.json manipulation
- **Triple Coverage**: Guaranteed updates for all three types:
  - Semantic tokens → `editor.semanticTokenColorCustomizations`
  - TextMate tokens → `editor.tokenColorCustomizations.textMateRules`
  - Workbench colors → `workbench.colorCustomizations`
- **Automatic Verification**: Built-in verification confirms every change is written to disk
- **Zero Failures**: Eliminates the "changes show in UI but don't persist" problem forever

### � Advanced Template Management (v2.0.0)
- **Dynamic Template Reloading**: Reload template elements from TEMPLATE.jsonc without restarting
- **Programmatic Element Updates**: Update individual template elements via API with immediate or deferred application
- **Template-UI Synchronization**: Ensure UI always reflects current template state with one-click sync
- **Real-time Statistics**: Monitor template coverage with live element counts across all categories
- **Message-Based Integration**: Full webview integration for template operations with comprehensive error handling
- **Development Workflow**: Perfect for theme authors with automatic template validation and testing capabilities

### �🔄 Live Preview
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
- **Load Empty Theme**: ✅ **Fully Fixed (v2.6.6)!** Start with clean white theme using `#ffffff` and `#ffffff00` (transparent) values
  - Complete overhaul of empty theme generation with robust fallback mechanisms
  - Fixed webview communication issues that prevented theme application
  - Added comprehensive debugging system for troubleshooting
  - Created standalone ***[Template](https://github.com/edasevar/theme-live-preview/blob/main/TEMPLATE.jsonc)*** for independent operation
  - Implemented triple-fallback strategy: template → file-based → manual generation
- **Export Custom Themes**: 🎯 **Enhanced (v2.6.7)!** Save themes with expanded TextMate token structure
  - **Individual Scope Export**: Each TextMate scope now gets its own separate entry (matches UI editing experience)
  - **Template-Like Structure**: Exported themes mirror how scopes are individually editable in the interface
  - **Perfect for Sharing**: Recipients can easily see and modify each token scope independently
  - Example: Instead of grouped scopes, each scope, such as `keyword.operator`, `keyword.operator.assignment`, etc. gets separate entries
- **Reset to Default**: Clear all customizations and restore original settings
- **Legacy Settings Cleanup**: Automatic cleanup of duplicate or incorrectly placed theme settings
- **Multiple Format Support**: JSON/JSONC theme files (with future support for .vsix and .css files)

## 🚀 Getting Started

### Installation
1. Install the extension from the VS Code marketplace (or package and install the .vsix file)
2. **NEW**: Look for the Theme Editor Live icon in the activity bar (color palette icon)
3. **Option 1 - Sidebar**: Click the activity bar icon to open the integrated sidebar with organized actions
4. **Option 2 - Command Palette**: Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and run `Theme Editor: Open Theme Editor Live`

### Basic Usage (Enhanced Workflow)
1. **Access via Sidebar**: Click the Theme Editor Live icon in the activity bar to open the sidebar
2. **Quick Color Editing**: 
   - Expand "🎨 Quick Colors" to edit common colors (errors, warnings, links, etc.)
   - Expand "🔤 Syntax Colors" to modify code highlighting (comments, keywords, strings, etc.)
   - Click any color item to open the color picker and see changes instantly
3. **Advanced Editing**: Click "🎨 Open Theme Editor" in the sidebar or use the command palette for comprehensive editing
4. **Navigate Sections**: Use the main editor sidebar to switch between Workbench UI, Semantic Tokens, and TextMate Tokens
5. **Edit Colors**: Click on color boxes or type hex values directly with full alpha channel support
6. **Search & Filter**: Use the search bar to quickly find specific color properties
7. **Preview Changes**: See changes applied instantly to VS Code and in the preview panel
8. **Manage Templates**: Use sidebar template management tools for advanced theme workflows
9. **View Statistics**: Access theme information and statistics directly from the sidebar

### 📂 TextMate Token Categories (v2.1.0)
TextMate tokens are now intelligently organized into **48 meaningful categories** for easier navigation:

#### Core Language Elements
- **Source & Base Structure**: Base source code, HTML, XML, TeX content
- **Language Keywords**: Core language keywords, control flow
- **Import & Module Keywords**: Import statements, module declarations
- **Exception Handling**: Try, catch, finally, throw keywords

#### Code Structure  
- **Class Definitions**: Class names and declarations
- **Interface Definitions**: Interface names and types
- **Function Names**: Function and method names
- **Method Definitions**: Method declarations and signatures

#### Variables & Properties
- **General Variables**: Standard variable names
- **Object Properties**: Object member properties  
- **Global & Special Variables**: Global vars, `this`, special identifiers
- **Function Parameters**: Parameter names and types
- **Constants & Readonly**: Constant values and readonly variables

#### Literals & Values
- **String Literals**: String values and components
- **Numeric Literals**: Numbers, decimals, scientific notation
- **Boolean & Language Constants**: True, false, null, undefined

#### Styling & Formatting
- **Basic Punctuation**: Semicolons, commas, quotes
- **Advanced Operators**: Mathematical and logical operators
- **Comments**: Standard and documentation comments

This categorization makes it much easier to find and customize specific types of syntax highlighting compared to the previous single "Other TextMate Tokens" section.

## 📋 Commands

| Command | Description | Sidebar Access |
|---------|-------------|---------------|
| `Theme Editor: Open Theme Editor Live` | Opens the main theme editor interface | 🎨 Open Theme Editor |
| `Theme Editor: Load Current Theme` | Load your current VS Code theme settings | Via main editor |
| `Theme Editor: Load Empty Theme` | Start with a clean white theme template | Via main editor |
| `Theme Editor: Export Current Theme` | Export your current theme customizations as JSON | Via main editor |
| `Theme Editor: Reset Theme to Default` | Reset all customizations to default settings | Via main editor |
| `Theme Editor: Cleanup Legacy Settings` | Clean up duplicate or incorrectly placed theme settings | 🧹 Clean Up Settings |
| **📋 Template Management Commands** (v2.0.0) | | **📁 Template Management** |
| `Theme Editor: Reload Template from TEMPLATE.jsonc` | Reload template elements from the template file | 🔄 Reload Template |
| `Theme Editor: Sync Template with UI` | Synchronize template state with the current UI | 🔗 Sync Template |
| `Theme Editor: Show Template Statistics` | Display template element counts and coverage statistics | 📊 Theme Statistics |
| `Theme Editor: Refresh Editor Webview` | Force refresh the theme editor interface (useful for development) | 🔄 Refresh Webview |
| **🧪 Nuclear Test Commands** (Developer/Debug) | | **⚙️ Settings & Tools** |
| `Theme Editor: Test Update` | Test direct file manipulation for settings updates | Via command palette |
| `Theme Editor: Nuclear Test` | Test nuclear option for TextMate token changes | Via command palette |
| `Theme Editor: Test All Nuclear` | **Comprehensive test of all three nuclear options** | Via command palette |

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
- **Accessibility**: Full keyboard navigation support with no disabled elements
- **Smart Warnings**: Visual indicators show setting requirements without blocking access
- **Direct Setting Navigation**: One-click access to required VS Code settings with exact paths

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

### Recent Improvements (v2.6.3)
- **Simplified Interface**: Completely removed preview boxes that weren't providing expected functionality for a cleaner, more focused color editing experience
- **Improved Performance**: Eliminated unnecessary DOM elements and JavaScript functions for better efficiency

### Previous Improvements (v2.6.2)
- **Cleaner Preview Interface**: Removed text labels from example preview boxes for a cleaner, more focused visual design
- **Enhanced Visual Design**: Example previews now show pure color representation without distracting text overlays

### Previous Improvements (v2.6.1)
- **Fixed Tooltip System**: Resolved tooltip initialization issues and added proper styling for different tooltip types
- **Enhanced Setting Navigation**: Fixed click handling for setting badges with improved visual feedback
- **Streamlined Initialization**: Consolidated initialization process for better performance and reliability
- **Documentation Updates**: Comprehensive updates to README, changelog, and added proper MIT license

### Previous Improvements (v2.5.1)
- **Enhanced User Experience**: Removed all disabled UI elements - items requiring settings now show clear warnings instead of being disabled
- **Smart Setting Requirements**: Visual indicators show which items require specific VS Code settings to be enabled
- **Direct Setting Navigation**: Click warning icons to navigate directly to the required VS Code setting with exact path shown
- **Comprehensive Warning System**: Color-coded warnings (yellow triangles) identify setting-dependent colors with detailed explanations
- **Expanded Setting Coverage**: Added detection for additional settings like editor line numbers, minimap, breadcrumbs, and more
- **Improved Accessibility**: Full keyboard navigation with no disabled elements blocking user interaction
- **Enhanced Visual Feedback**: Clear visual indicators and tooltips explain setting requirements without preventing access

### Previous Improvements (v1.0.0)
- **Fixed TextMate Token Routing**: Resolved issues where TextMate tokens weren't properly routing to `editor.tokenColorCustomizations`
- **Complete Token Coverage**: All missing TextMate tokens now display in the UI with proper default values
- **Settings Management**: Improved routing logic to ensure colors go to correct VS Code settings sections
- **TypeScript Interfaces**: Fixed interface definitions for proper type safety and settings handling
- **Legacy Cleanup**: Added automatic cleanup of duplicate settings and legacy configurations

### File Structure
```
├── src/
│   ├── extension.ts              # Main extension entry point with sidebar integration
│   ├── panel/
│   │   └── ThemeEditorPanel.ts   # Webview panel implementation
│   ├── utils/
│   │   └── themeManager.ts       # Theme loading/saving logic
│   └── views/
│       └── ThemeEditorTreeProvider.ts  # NEW: Sidebar tree data provider
├── media/
│   ├── editor-ui.js              # Frontend JavaScript
│   ├── style.css                 # UI styling
│   ├── icon.png                  # NEW: Extension icon for activity bar
│   └── icon.svg                  # NEW: Source icon design
├── themes/
│   └── empty-theme.json          # Empty theme template
└── TEMPLATE.jsonc                # Complete theme structure reference
```

### Extension Architecture
- **Main Extension**: Registers commands and manages lifecycle with proper cleanup and sidebar integration
- **Sidebar Integration**: Custom tree data provider with organized action categories and professional UI
- **Theme Manager**: Handles theme operations (load, save, apply) with smart settings routing
- **Webview Panel**: Provides the visual editor interface with transparency controls
- **Live Preview**: Real-time VS Code theme updates with proper token routing
- **Settings Integration**: Direct VS Code configuration API with legacy cleanup support

## 🐛 Known Issues Fixed

### v2.6.6 Fixes (Latest)
- ✅ **Empty Theme Loading**: Fixed "Load Empty Theme" functionality that was completely broken
- ✅ **Webview Refresh**: Resolved issue where theme data wasn't being sent to webview for visual updates
- ✅ **Fallback System**: Added robust fallback mechanism when template theme fails to load properly
- ✅ **Independent Structure**: Created standalone `empty-theme.json` for reliable empty theme generation
- ✅ **Debug Logging**: Added comprehensive logging to troubleshoot empty theme issues
- ✅ **Multiple Strategies**: Implemented template-based, file-based, and manual fallback approaches

### v2.6.5 Fixes
- ✅ **Map Iteration Fix**: Fixed TypeScript compilation error with Map iteration in ThemeEditorPanel
- ✅ **ES2020 Compatibility**: Replaced `for...of` syntax with `.forEach()` method for better compatibility
- ✅ **Build System**: Resolved `--downlevelIteration` flag requirement error

### v2.6.4 Fixes
- ✅ **Opacity Boxes Removed**: Completely removed the top-left opacity indicator boxes from all color items
- ✅ **Interface Cleanup**: Eliminated `opacity-required` status badges and associated CSS/JavaScript
- ✅ **Build System Repair**: Fixed spontaneous file deletions and restored missing ThemeManager functionality

### v2.6.3 Fixes
- ✅ **Preview Boxes Removed**: Eliminated non-functional preview boxes that didn't meet user expectations
- ✅ **Simplified Layout**: Cleaner color item interface without distracting preview elements
- ✅ **Performance Optimization**: Removed unnecessary code and DOM elements for better efficiency
- ✅ **Code Cleanup**: Commented out unused methods and cleaned up associated functionality

### v2.6.2 Fixes
- ✅ **Clean Preview Design**: Removed distracting text labels from example preview boxes
- ✅ **Improved Visual Focus**: Example previews now display pure color representation without text overlays
- ✅ **Enhanced Interface**: Cleaner, more professional appearance for color preview elements

### v2.6.1 Fixes
- ✅ **Tooltip Initialization**: Fixed missing tooltip system initialization causing tooltips not to appear
- ✅ **Setting Badge Styling**: Added proper CSS classes for different tooltip types (setting-info, opacity-info)
- ✅ **Navigation Cleanup**: Removed redundant event listeners and streamlined click handling
- ✅ **Documentation**: Updated all project documentation including proper licensing

### v2.5.1 Fixes
- ✅ **Disabled Items Removed**: Eliminated all disabled UI elements that prevented user interaction - now shows warnings instead
- ✅ **Setting Requirements**: Clear visual indicators show exactly which VS Code settings need to be enabled for specific colors
- ✅ **Direct Navigation**: Added one-click navigation to required settings with exact setting paths displayed
- ✅ **Enhanced Accessibility**: Removed barriers preventing users from accessing any theme customization options
- ✅ **Visual Warning System**: Implemented color-coded warning triangles with detailed requirement explanations

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
