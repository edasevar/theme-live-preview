# Changelog

All notable changes to the Theme Editor Live extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.1] - 2025-07-29

### 🚀 Major UX Overhaul: No More Disabled Items!
This release completely transforms how setting-dependent colors are handled, moving from a confusing "disabled" approach to helpful guidance that keeps all functionality accessible.

### Fixed
- **❌ Removed Item Disabling**: Items that require specific VS Code settings are no longer disabled
  - Removed `opacity: 0.4`, `pointer-events: none`, and `filter: grayscale(0.8)` from setting-dependent items
  - Removed control blurring with `filter: blur(1px)` that made controls unusable
  - All color controls are now fully interactive regardless of setting requirements
- **🎯 Clear Setting Requirements**: Dramatically improved visibility of which settings are needed
  - Setting badges now show gear icon (⚙️) plus exact setting name (e.g., "⚙️ editor.selectionHighlight")
  - Added prominent warning messages: "⚠️ Requires 'editor.selectionHighlight' to be enabled to take effect"
  - Enhanced setting mapping for common cases like breadcrumbs, minimap, title bar, and peek view settings

### Enhanced
- **🔗 Better Setting Navigation**: Improved clickable setting badges for direct access
  - Click setting badges to open VS Code settings and search for the specific setting
  - Enhanced navigation mapping with more comprehensive setting relationships
  - Updated legend to reflect new "advisory" approach instead of "disabled" approach
- **⚠️ Visual Warning System**: Replaced disabling with helpful visual indicators
  - Orange left border on items that require settings (instead of graying out)
  - Styled warning messages with background highlights and clear typography
  - Normal hover states maintained for better interaction feedback
- **📋 Expanded Setting Coverage**: Added support for more setting-dependent features
  - Minimap colors: requires `editor.minimap.enabled`
  - Peek view colors: requires `editor.peekWidgetDefaultFocus`
  - Breadcrumb colors: requires `breadcrumbs.enabled`
  - Title bar colors: requires `window.titleBarStyle`
  - And many more comprehensive mappings

### Technical Improvements
- **🎨 CSS Architecture**: Complete overhaul of setting-dependent styling
  - Removed all disabling CSS rules that blocked user interaction
  - Added `.setting-warning` class for consistent warning display
  - Enhanced hover states with warning-colored borders instead of blocking interaction
- **🔧 Enhanced Functionality**: All features remain accessible with better guidance
  - Users can modify colors even if the setting isn't enabled yet
  - Clear guidance on exactly which setting to enable
  - Direct navigation to settings with one click
  - No more confusion about why items are disabled

### Benefits
- **🎯 Zero Functionality Loss**: Users can now modify any color regardless of setting state
- **📖 Clear Guidance**: Exact setting names and requirements are always visible
- **🚀 Better UX**: No more frustrating disabled controls - everything is accessible
- **🔍 Enhanced Discovery**: Users learn about VS Code settings through helpful warnings instead of blocks

## [2.1.0] - 2025-07-29

### 🎯 Major User Experience Improvement
This release focuses on dramatically improving the TextMate token editing experience by replacing the confusing single "Other TextMate Tokens" section with 48 intelligently organized categories.

### Added
- **📂 Smart TextMate Token Categorization**: Revolutionary organization of TextMate tokens into meaningful categories
  - **48 Logical Categories**: Tokens now organized by functionality instead of generic "Other TextMate Tokens"
  - **Complete Coverage**: All 122+ TextMate token scopes properly categorized from TEMPLATE.jsonc
  - **Enhanced Discovery**: Categories like "Source & Base Structure", "Language Keywords", "Function Names", "Class Definitions", etc.
  - **Dynamic Parsing**: Intelligent parsing of TEMPLATE.jsonc comment headers to extract category structure
  - **Fallback System**: Graceful fallback to basic categories if parsing fails

### Fixed
- **TextMate Token Organization**: Resolved issue where all TextMate tokens appeared in a single "Other" section
  - Fixed regex pattern for detecting tokenColors section boundaries in TEMPLATE.jsonc
  - Enhanced parsing logic to handle both single-line and multiline scope arrays
  - Improved state tracking for nested JSON structures during parsing
- **Template Parsing Reliability**: Strengthened parsing algorithm to handle complex TEMPLATE.jsonc structures
  - Better handling of comment-based category headers (`// --- Category Name ---`)
  - Improved detection of scope arrays and individual scope strings
  - Fixed edge cases in JSON parsing with mixed formatting

### Enhanced
- **Developer Experience**: Added comprehensive debugging and refresh capabilities
  - New command: `Theme Editor: Refresh Editor Webview` for forcing UI updates during development
  - Enhanced logging for TextMate token parsing with detailed category statistics
  - Improved error handling and graceful degradation when parsing fails
- **UI Organization**: TextMate tokens now display in organized, collapsible categories
  - Categories show token count for better overview
  - Logical grouping improves token discovery and editing workflow
  - Consistent with existing Workbench and Semantic token section organization

### Technical Improvements
- **Parser Enhancement**: Complete rewrite of `parseTextMateCategoriesFromFile()` method
  - Sophisticated state machine for tracking JSON parsing context
  - Robust regex patterns for category detection and section boundaries
  - Support for both compact and formatted JSON structures
- **Webview Integration**: Enhanced webview refresh system for better development experience
  - Force refresh capability bypasses VS Code webview caching
  - Improved message passing between extension and webview
  - Better error reporting and status feedback

### Categories Added
The extension now organizes TextMate tokens into these 48 categories:
- Source & Base Structure, Basic Punctuation & Delimiters, Advanced Punctuation & Operators
- Language Keywords, Import & Module Keywords, Exception Handling Keywords
- Operators, Storage & Modifiers, String Literals, String Components
- Numeric Literals, Boolean & Language Constants, Support Constants
- Standard Comments, Documentation Comments, General Variables
- Object Properties, Object Variables, Global & Special Variables
- Local Variables, Function Parameters, Constants & Readonly
- Method Definitions, Function Names, Function Variables, Function Meta Information
- Preprocessor Functions, Class Definitions, Interface Definitions
- Struct Definitions, Enum Definitions, Built-in Types, Type Parameters & Annotations
- HTML/XML Tag Names, HTML Attributes, Markup & Content
- Git Diff & Version Control, Decorators, Annotations & Meta
- Namespaces, Modules, Labels, Component Classes
- Information Tokens, Warning Tokens, Error Tokens, Debug Tokens, Invalid & Deprecated

## [1.1.0] - 2025-07-29

### Added
- **🚀 Nuclear Option Settings Updates**: Revolutionary direct file manipulation system that bypasses VS Code's broken API
  - **100% Guaranteed Settings Updates**: All color changes now persist to settings immediately
  - **Triple Nuclear Coverage**: Direct file manipulation for all three update types:
    - Semantic tokens (`semantic_*`) → `editor.semanticTokenColorCustomizations`
    - TextMate tokens (`textmate_*`) → `editor.tokenColorCustomizations.textMateRules`
    - Workbench colors (all others) → `workbench.colorCustomizations`
  - **Multi-Method Replacement**: Multiple regex patterns ensure updates work in all scenarios
  - **Automatic Verification**: Built-in verification system confirms all changes are written to disk
  - **Comprehensive Error Handling**: Robust fallback systems and detailed logging

### Fixed
- **🔥 CRITICAL BUG RESOLVED**: Settings not persisting despite appearing to update in UI
  - Root cause: VS Code API `config.update()` fails in Extension Development Host mode
  - Solution: Complete bypass of VS Code API using direct file system operations
- **Settings Update Reliability**: Eliminated all cases where color changes wouldn't persist
- **TextMate Token Updates**: Fixed broken TextMate scope color updates
- **Semantic Token Updates**: Resolved semantic token color persistence issues
- **Workbench Color Updates**: Ensured all UI color changes save correctly

### Technical Improvements
- **Direct File Manipulation**: Added `updateSettingsFileDirect()`, `updateSemanticTokenDirect()`, and `updateWorkbenchColorDirect()` methods
- **Enhanced Scope Matching**: Improved TextMate scope detection and replacement algorithms
- **Nuclear Option Architecture**: Completely bypasses unreliable VS Code configuration API
- **Verification Systems**: Added post-update verification to confirm all changes are applied
- **Debug Commands**: Added comprehensive test commands for all nuclear options:
  - `themeEditor.testUpdate` - Test direct file manipulation
  - `themeEditor.nuclearTest` - Test TextMate nuclear option
  - `themeEditor.testAllNuclear` - **Test all three nuclear options simultaneously**

### Enhanced User Experience
- **Instant Updates**: All color changes now apply immediately without API delays
- **Reliable Notifications**: Success/failure notifications for all update operations
- **Better Error Messages**: Clear feedback when updates succeed or fail
- **No More Frustration**: Eliminated the "changes show in UI but don't persist" issue

### Developer Experience
- **Nuclear Test Suite**: Comprehensive testing commands for validation
- **Enhanced Logging**: Detailed console output for debugging and verification
- **Fallback Systems**: Multiple replacement methods ensure updates always work
- **File System Integration**: Direct integration with VS Code settings file

## [1.0.0] - 2025-07-29

### Added
- **Theme Editor Panel**: Interactive webview panel for live theme editing with real-time preview
- **Transparency Controls**: Alpha/opacity sliders and numeric inputs for all color values
  - Support for 8-digit hex colors with alpha channel (#RRGGBBAA)
  - Percentage-based alpha controls (0-100%)
  - Real-time synchronization between color picker, hex input, and alpha controls
- **Complete Token Support**: Comprehensive coverage of VS Code theming system
  - Workbench colors (200+ UI elements)
  - Semantic token colors with style modifiers
  - TextMate token colors with extensive scope coverage
- **Smart Settings Management**: Proper routing to correct VS Code settings sections
  - Workbench colors → `workbench.colorCustomizations`
  - Semantic tokens → `editor.semanticTokenColorCustomizations.rules`
  - TextMate tokens → `editor.tokenColorCustomizations.textMateRules`
- **Legacy Settings Cleanup**: Automatic detection and cleanup of incorrectly placed settings
- **Theme Management Features**:
  - Load Empty Theme: Reset to clean white theme for new theme development
  - Load Current Theme: Import existing VS Code theme settings
  - Export Theme: Save current customizations as .json theme file
  - Reset Colors: Clear all customizations and restore defaults
- **Advanced UI Features**:
  - Categorized color sections with expand/collapse functionality
  - Real-time search and filtering across all color tokens
  - Section navigation (Workbench, Semantic Tokens, TextMate Tokens)
  - Color update feedback and error handling
  - Responsive design with optimized performance
- **Developer Experience**:
  - TypeScript implementation with full type safety
  - Comprehensive error handling and logging
  - Throttled updates for optimal performance
  - Extensive documentation and code comments

### Technical Implementation
- **Extension Architecture**: VS Code WebView API with message-based communication
- **Theme Processing**: Complete VS Code theme specification support
- **Color Management**: Advanced color validation and conversion utilities
- **Settings Integration**: Direct VS Code configuration API integration
- **UI Components**: Custom HTML/CSS/JavaScript interface with VS Code design system
- **Performance Optimization**: Batched updates and throttled operations

### Token Coverage
- **Workbench Colors**: 200+ UI elements including editor, sidebar, terminal, statusbar, etc.
- **Semantic Tokens**: All standard semantic token types with style modifiers
- **TextMate Tokens**: Comprehensive scope coverage including:
  - Language constructs (classes, functions, variables, keywords)
  - Literals (strings, numbers, booleans, constants)
  - Comments and documentation
  - Markup and HTML elements
  - Debug and error tokens
  - Namespaces and modules
  - Operators and punctuation

### Fixed Issues
- **Settings Routing**: Corrected improper routing of semantic tokens to wrong settings sections
- **TextMate Token Visibility**: Fixed missing TextMate tokens in extension UI
- **Type Safety**: Resolved TypeScript interface inconsistencies for token definitions
- **Empty Theme Functionality**: Repaired broken empty theme loading with complete token coverage
- **Alpha Channel Support**: Implemented proper transparency handling across all color inputs
- **Settings Cleanup**: Added automatic cleanup of duplicate/legacy settings configurations

### Commands
- `extension.themeEditor`: Open Theme Editor panel
- `themeEditor.cleanupSettings`: Clean up legacy/duplicate theme settings
- **🧪 Nuclear Test Commands** (Development & Debugging):
  - `themeEditor.testUpdate`: Test direct file manipulation for TextMate tokens
  - `themeEditor.nuclearTest`: Test nuclear option for specific TextMate token changes  
  - `themeEditor.testAllNuclear`: **Comprehensive test of all three nuclear options**
    - Tests semantic token updates (class → bright red)
    - Tests TextMate token updates (debug-token → bright blue)
    - Tests workbench color updates (editor.background → dark green)

### Dependencies
- VS Code Engine: ^1.60.0
- TypeScript compilation support
- JSONC parser for theme file processing

---

## Development Notes

This extension provides a comprehensive solution for VS Code theme development and customization. It bridges the gap between VS Code's complex theming system and user-friendly visual editing, offering:

- **Complete Coverage**: All aspects of VS Code theming in one interface
- **Professional Tools**: Advanced features for theme developers and designers  
- **User-Friendly**: Intuitive interface for casual users wanting to customize their editor
- **Performance Focused**: Optimized for smooth real-time editing experience
- **Standards Compliant**: Full compatibility with VS Code theme specification

The extension handles the complexity of VS Code's theming system while providing a simple, visual interface for theme creation and modification.

## Links

[2.1.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.1.0
[1.1.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v1.1.0
[1.0.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v1.0.0
