# Changelog

All notable changes to the Theme Editor Live extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.1.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v1.1.0
[1.0.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v1.0.0
