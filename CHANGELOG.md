# Changelog

All notable changes to the Theme Editor Live extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v1.0.0
