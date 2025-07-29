# Changelog

All notable changes to the Theme Editor Live extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-07-29

### 🎨 Major Release: Beautiful Sidebar Integration

This major release introduces a comprehensive sidebar interface that makes Theme Editor Live more accessible and visually appealing, transforming it from a command-only extension to a fully integrated VS Code experience.

### Added
- **📍 Activity Bar Integration**: Dedicated Theme Editor Live icon in the activity bar
  - **Professional Icon Design**: Custom color palette icon with gradient background and paint brush elements
  - **SVG + PNG Support**: High-quality vector graphics with PNG fallback for compatibility
  - **Visual Identity**: Distinctive icon that clearly represents theme editing functionality

- **🏗️ Comprehensive Sidebar Panel**: Custom tree-structured sidebar with organized functionality
  - **Smart Organization**: Five main categories for logical workflow organization
  - **Collapsible Structure**: Expandable/collapsible categories for clean interface
  - **Contextual Icons**: Professional VS Code theme icons for each action (paintbrush, tools, rocket, graph, etc.)
  - **Rich Tooltips**: Detailed descriptions for each action and category

- **📋 Organized Action Categories**:
  - **🎨 Main Editor**: Direct access to open the visual theme editor with real-time preview
  - **📁 Template Management**: Template reload and synchronization operations with detailed descriptions
  - **⚙️ Settings & Tools**: Theme cleanup, maintenance, and webview refresh functionality
  - **📊 Theme Statistics**: Quick access to theme information and detailed statistics
  - **🚀 Quick Actions**: Frequently used operations for streamlined workflow (launch editor, view stats)

- **🎨 Direct Color Editing from Sidebar**: Revolutionary instant color editing without opening the main editor
  - **🎨 Quick Colors Category**: Edit common colors directly from expandable tree items
    - **🔴 Errors**: Instant editing of error message colors (`errorForeground`)
    - **⚠️ Warnings**: Direct warning color modifications (`warningForeground`)
    - **ℹ️ Info Messages**: Information message color editing (`infoForeground`)
    - **🎯 Focus Border**: Focus indicator border color editing (`focusBorder`)
    - **🔗 Links**: Clickable link color modifications (`textLinkForeground`)
    - **✅ Success**: Success indicator color editing (`successForeground`)
  - **🔤 Syntax Colors Category**: Code highlighting color editing with one-click access
    - **💬 Comments**: Code comment color editing (`comment` token)
    - **🔤 Keywords**: Language keyword color modifications (`keyword` token)
    - **📝 Strings**: String literal color editing (`string` token)
    - **🔢 Numbers**: Numeric literal color modifications (`number` token)
    - **🏷️ Variables**: Variable name color editing (`variable` token)
    - **⚡ Functions**: Function name color modifications (`function` token)
  - **⚡ One-Click Color Picker**: Click any color item to open VS Code's native color picker
  - **🔄 Instant Application**: Changes apply immediately to VS Code interface with no reload required
  - **🎯 Smart Color Routing**: Colors automatically routed to correct VS Code settings sections

- **🌟 Enhanced Welcome Experience**: Rich welcome content when sidebar is first opened
  - **Feature Highlights**: Checkmark list showcasing key capabilities (real-time preview, alpha support, etc.)
  - **Quick Action Buttons**: Direct access to main functions via clickable links
  - **Professional Formatting**: Markdown-formatted content with emojis and clear structure
  - **Getting Started Guide**: Immediate access to core functionality

### Technical Implementation
- **🔧 Tree Data Provider**: Custom `ThemeEditorTreeProvider` class with full TypeScript support
  - **Dynamic Tree Structure**: Intelligent tree building with parent-child relationships
  - **Icon Management**: VS Code theme icon integration with contextual visual cues
  - **Command Integration**: Seamless integration with all existing extension commands
  - **State Management**: Proper tree refresh and state handling

- **📦 Package.json Enhancements**: Comprehensive manifest updates for sidebar functionality
  - **Views Container**: Custom activity bar container with professional icon
  - **View Registration**: Proper view registration with conditional visibility
  - **Menu Contributions**: Enhanced menu system with view/title actions
  - **Welcome Content**: Rich viewsWelcome content with interactive elements
  - **Activation Events**: Expanded activation events for sidebar integration

- **🔗 Command Extensions**: Enhanced command system for sidebar integration
  - **New Command**: `themeEditor.openFromSidebar` for sidebar-specific launching
  - **New Command**: `themeEditor.editColor` for direct color editing from sidebar items
  - **Enhanced Registration**: All commands properly registered with sidebar context
  - **VS Code Settings API Integration**: Direct color editing uses VS Code's configuration API for instant updates
  - **Improved Error Handling**: Robust error handling for sidebar-initiated actions

### Enhanced User Experience
- **🎯 One-Click Access**: No more hunting through command palette - everything visible in sidebar
- **🎨 Instant Color Editing**: Edit common colors directly from sidebar without opening main editor
- **📱 Mobile-Like Interface**: Intuitive tree structure similar to VS Code's built-in panels
- **🚀 Faster Workflow**: Direct access to all theme editing functionality from dedicated panel
- **📖 Better Discovery**: New users can easily find and understand all available features
- **⚡ Zero-Friction Editing**: Click any color in sidebar → VS Code color picker opens → changes apply instantly
- **🎨 Professional Appearance**: Matches VS Code's design language with consistent styling

### Compatibility & Migration
- **🔄 Backward Compatible**: All existing commands and functionality remain unchanged
- **📈 Enhanced Access**: New sidebar provides additional access methods without removing existing ones
- **⚙️ Existing Workflows**: Users can continue using command palette alongside new sidebar
- **🔧 No Breaking Changes**: Existing theme files, settings, and workflows continue to work exactly as before

### File Changes
- **New Files Added**:
  - `src/views/ThemeEditorTreeProvider.ts` - Sidebar tree data provider implementation
  - `media/icon.png` - Extension icon for activity bar (128x128 PNG)
  - `media/icon.svg` - Source icon design with gradient and theme elements
  - `media/icon-readme.md` - Icon documentation and creation notes

- **Enhanced Files**:
  - `src/extension.ts` - Added sidebar tree provider registration and new command
  - `package.json` - Added views, viewsContainers, viewsWelcome, and menu contributions
  - `README.md` - Updated with sidebar usage instructions and enhanced getting started guide
  - `CHANGELOG.md` - This comprehensive release documentation

### Benefits Summary
- **🎯 **Improved Accessibility**: Theme editing is now one click away from any VS Code session
- **📱 **Modern UX**: Professional sidebar interface matches VS Code's design standards  
- **🚀 **Faster Workflow**: Organized categories and quick actions speed up common tasks
- **📖 **Better Onboarding**: Rich welcome content and clear action descriptions help new users
- **🔍 **Enhanced Discovery**: Users can easily see all available functionality in organized tree structure
- **🎨 **Professional Polish**: High-quality icons and careful attention to visual design details

## [2.6.7] - 2025-07-29

### Enhanced
- **📤 Export Functionality Overhaul**: Completely redesigned theme export to match UI editing experience
  - **Individual TextMate Scopes**: Each scope now gets its own separate entry in exported themes
  - **UI-Consistent Structure**: Exported themes mirror exactly how scopes are displayed and edited in the interface
  - **Granular Control**: Recipients can easily see and modify each token scope independently
  - **Template-Like Format**: Exported files follow the same structure as TEMPLATE.jsonc for consistency
  - **Example**: Instead of `"scope": ["keyword.operator", "keyword.operator.assignment"]`, now exports separate entries for each scope
  
### Technical Implementation
- **New Method**: Added `expandTextMateTokens()` method in `ThemeEditorPanel`
- **Scope Expansion**: Automatically separates grouped scopes into individual token rules during export
- **Type Safety**: Full TypeScript implementation with proper `ThemeDefinition` interface usage
- **Backward Compatibility**: Maintains compatibility with existing theme structures

## [2.6.6] - 2025-07-29

### Fixed
- **🔧 Empty Theme Loading**: Completely fixed "Load Empty Theme" functionality that was broken
  - **Root Cause**: Fixed webview `refreshTheme` message that was sent without theme data
  - **TextMate Token Keys**: Corrected key mismatch between backend (`token_${i}`) and frontend (`textmate_${scope}`)
  - **WebView Communication**: Fixed theme data not being properly transmitted to frontend
  - **Fallback System**: Implemented triple-fallback strategy for robust theme generation
  - **Debug System**: Added comprehensive step-by-step logging throughout the process
  - Empty theme now properly applies white colors (`#ffffff`) and transparent backgrounds (`#ffffff00`)

### Added
- **📁 Empty Theme File**: Created `themes/empty-theme.json` with complete empty theme structure
  - Provides standalone fallback when template-based generation fails
  - Includes essential workbench colors (50+ elements), semantic tokens, and TextMate token colors
  - Ensures empty theme functionality works independently of template system
- **🔍 Enhanced Debugging**: Added comprehensive logging across all components
  - Step-by-step execution tracking in `handleLoadEmptyTheme` method
  - Detailed fallback strategy logging in `getEmptyTheme` method  
  - Frontend theme application debugging in `refreshTheme` handler
  - Complete visibility into theme loading process for troubleshooting

### Technical Details
- **Backend**: Enhanced `ThemeEditorPanel.handleLoadEmptyTheme()` with detailed logging
- **ThemeManager**: Improved `getEmptyTheme()` with multiple fallback strategies
- **Frontend**: Fixed `refreshTheme` handler to properly process TextMate tokens by scope
- **WebView**: Corrected message passing to include complete theme data structure

## [2.6.5] - 2025-07-29

### Fixed
- **🔧 Map Iteration Fix**: Fixed TypeScript compilation error with Map iteration in ThemeEditorPanel
  - Replaced ES2015+ `for...of` syntax with `.forEach()` method for better ES2020 compatibility
  - Ensures proper compilation across different TypeScript versions and configurations
  - Resolved `--downlevelIteration` flag requirement error

## [2.6.4] - 2025-07-29

### Removed
- **🗑️ Opacity Boxes Removed**: Completely removed the top-left opacity indicator boxes from all color items
  - Removed `opacity-required` status badges from workbench colors, semantic tokens, and TextMate tokens
  - Cleaned up associated CSS rules for `.status-badge.opacity-required`
  - Removed tooltip handlers for opacity-related elements from JavaScript
  - Streamlined interface by removing visual clutter while maintaining functionality

### Fixed
- **🔧 Build System Repair**: Fixed spontaneous file deletions and compilation errors
  - Restored missing ThemeManager class exports and essential functionality
  - Fixed syntax errors preventing proper module resolution
  - Ensured all imports and exports work correctly across the codebase
  - Rebuilt output directory for clean compilation state

### Enhanced
- **⚡ Cleaner Interface**: Color items now have a more streamlined appearance without opacity indicators
- **🎯 Better Focus**: Removed distracting UI elements to focus on core color editing functionality

## [2.6.3] - 2025-07-29

### Removed
- **🗑️ Preview Boxes Removed**: Completely removed example preview boxes that weren't providing expected functionality
  - Removed `.example-visual` and `.example-preview` elements from all color items
  - Cleaned up associated CSS styles and JavaScript functionality
  - Removed `updateExampleVisuals()` and `initializeExampleVisuals()` functions
  - Commented out unused `getExampleVisualClass()` method in TypeScript
  - Simplified color item layout for cleaner, more focused interface

### Enhanced
- **🎯 Cleaner Interface**: Color items now have a simplified layout without distracting preview elements
- **⚡ Better Performance**: Removed unnecessary DOM elements and event listeners for improved efficiency

## [2.6.2] - 2025-07-29

### Enhanced
- **🎨 Cleaner Preview Boxes**: Removed text labels ("editor", "status", "tab", etc.) from example preview boxes
  - Example previews now show pure color previews without distracting text overlays
  - Simplified visual design focuses attention on actual color representation
  - Improved readability and cleaner interface appearance

## [2.6.1] - 2025-07-29

### Fixed
- **🔧 Tooltip System**: Fixed tooltip initialization and styling issues
  - Added missing `initializeSettingNavigation()` call to main initialization sequence
  - Added proper CSS styling for `tooltip-setting-info` and `tooltip-opacity-info` classes
  - Removed redundant DOMContentLoaded event listener causing conflicts
- **🎨 Tooltip Styling**: Enhanced tooltip appearance with type-specific colors
  - Setting tooltips now use accent colors for better visibility
  - Opacity/transparency tooltips use warning colors for appropriate emphasis
  - Fixed tooltip positioning and arrow styling
- **📚 Documentation**: Updated README and LICENSE files
  - Enhanced README with recent UX improvements and accessibility features
  - Added proper MIT License to the project
  - Updated technical details section with comprehensive improvement history

### Enhanced
- **⚡ Better Initialization**: Streamlined initialization process
  - Consolidated tooltip and navigation initialization into main sequence
  - Removed duplicate initialization calls for better performance
  - Improved error handling for tooltip display

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

[3.0.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v3.0.0
[2.6.7]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.6.7
[2.6.6]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.6.6
[2.6.5]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.6.5
[2.6.4]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.6.4
[2.6.3]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.6.3
[2.6.2]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.6.2
[2.6.1]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.6.1
[2.5.1]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.5.1
[2.1.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v2.1.0
[1.1.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v1.1.0
[1.0.0]: https://github.com/edasevar/theme-live-preview/releases/tag/v1.0.0
