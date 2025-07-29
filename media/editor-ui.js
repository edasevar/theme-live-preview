/* global acquireVsCodeApi */
const vscode = acquireVsCodeApi();

// Enhanced semantic token mapping for comprehensive live preview
const semanticMap = {
  // Language constructs
  "keyword": "--token-keyword",
  "keyword.control": "--token-keyword-control",
  "keyword.operator": "--token-keyword-operator",
  "keyword.other": "--token-keyword-other",
  
  // Functions and methods
  "function": "--token-function",
  "function.declaration": "--token-function-declaration",
  "function.call": "--token-function-call",
  "method": "--token-method",
  "method.declaration": "--token-method-declaration",
  "method.call": "--token-method-call",
  
  // Variables and parameters
  "variable": "--token-variable",
  "variable.declaration": "--token-variable-declaration",
  "variable.readonly": "--token-variable-readonly",
  "variable.parameter": "--token-parameter",
  "parameter": "--token-parameter",
  "parameter.declaration": "--token-parameter-declaration",
  
  // Types and classes
  "type": "--token-type",
  "type.declaration": "--token-type-declaration",
  "class": "--token-class",
  "class.declaration": "--token-class-declaration",
  "interface": "--token-interface",
  "interface.declaration": "--token-interface-declaration",
  "struct": "--token-struct",
  "enum": "--token-enum",
  "enumMember": "--token-enum-member",
  
  // Properties and members
  "property": "--token-property",
  "property.declaration": "--token-property-declaration",
  "property.readonly": "--token-property-readonly",
  "member": "--token-member",
  "field": "--token-field",
  
  // Literals and constants
  "string": "--token-string",
  "string.escape": "--token-string-escape",
  "number": "--token-number",
  "boolean": "--token-boolean",
  "regexp": "--token-regexp",
  "constant": "--token-constant",
  
  // Comments and documentation
  "comment": "--token-comment",
  "comment.line": "--token-comment-line",
  "comment.block": "--token-comment-block",
  "comment.documentation": "--token-comment-documentation",
  
  // Operators and punctuation
  "operator": "--token-operator",
  "operator.arithmetic": "--token-operator-arithmetic",
  "operator.logical": "--token-operator-logical",
  "operator.comparison": "--token-operator-comparison",
  "punctuation": "--token-punctuation",
  "punctuation.bracket": "--token-punctuation-bracket",
  "punctuation.delimiter": "--token-punctuation-delimiter",
  
  // Namespaces and modules
  "namespace": "--token-namespace",
  "module": "--token-module",
  "package": "--token-package",
  
  // Labels and decorators
  "label": "--token-label",
  "decorator": "--token-decorator",
  "annotation": "--token-annotation",
  
  // Markup and special tokens
  "tag": "--token-tag",
  "attribute": "--token-attribute",
  "macro": "--token-macro",
  "generic": "--token-generic",
  "lifetime": "--token-lifetime",
  
  // Modifiers
  "modifier": "--token-modifier",
  "modifier.async": "--token-modifier-async",
  "modifier.static": "--token-modifier-static",
  "modifier.readonly": "--token-modifier-readonly"
};

// Comprehensive UI color mapping to CSS variables for complete theming
const uiMap = {
  // Core Editor Colors
  'editor.background': '--bg-primary',
  'editor.foreground': '--text-primary',
  'editor.selectionBackground': '--selection-bg',
  'editor.selectionForeground': '--selection-fg',
  'editor.inactiveSelectionBackground': '--selection-inactive-bg',
  'editor.selectionHighlightBackground': '--selection-highlight-bg',
  'editor.findMatchBackground': '--find-match-bg',
  'editor.findMatchHighlightBackground': '--find-match-highlight-bg',
  'editor.currentLineBackground': '--current-line-bg',
  'editor.lineHighlightBorder': '--line-highlight-border',
  'editor.rangeHighlightBackground': '--range-highlight-bg',
  'editor.wordHighlightBackground': '--word-highlight-bg',
  'editor.wordHighlightStrongBackground': '--word-highlight-strong-bg',
  
  // Sidebar and Explorer
  'sideBar.background': '--bg-secondary',
  'sideBar.foreground': '--text-primary',
  'sideBar.border': '--border-color',
  'sideBar.dropBackground': '--sidebar-drop-bg',
  'sideBarTitle.foreground': '--sidebar-title-fg',
  'sideBarSectionHeader.background': '--sidebar-section-header-bg',
  'sideBarSectionHeader.foreground': '--sidebar-section-header-fg',
  'sideBarSectionHeader.border': '--sidebar-section-header-border',
  
  // Activity Bar
  'activityBar.background': '--activity-bar-bg',
  'activityBar.foreground': '--activity-bar-fg',
  'activityBar.inactiveForeground': '--activity-bar-inactive-fg',
  'activityBar.border': '--activity-bar-border',
  'activityBar.activeBorder': '--activity-bar-active-border',
  'activityBar.activeBackground': '--activity-bar-active-bg',
  'activityBar.activeFocusBorder': '--activity-bar-active-focus-border',
  'activityBarBadge.background': '--activity-bar-badge-bg',
  'activityBarBadge.foreground': '--activity-bar-badge-fg',
  
  // Panel (Terminal, Output, etc.)
  'panel.background': '--bg-secondary',
  'panel.border': '--border-color',
  'panel.dropBorder': '--panel-drop-border',
  'panelTitle.activeBorder': '--panel-title-active-border',
  'panelTitle.activeForeground': '--panel-title-active-fg',
  'panelTitle.inactiveForeground': '--panel-title-inactive-fg',
  'panelInput.border': '--border-color',
  'panelSection.border': '--panel-section-border',
  'panelSection.dropBackground': '--panel-section-drop-bg',
  'panelSectionHeader.background': '--panel-section-header-bg',
  'panelSectionHeader.foreground': '--panel-section-header-fg',
  'panelSectionHeader.border': '--panel-section-header-border',
  
  // Status Bar
  'statusBar.background': '--status-bar-bg',
  'statusBar.foreground': '--status-bar-fg',
  'statusBar.border': '--status-bar-border',
  'statusBar.debuggingBackground': '--status-bar-debugging-bg',
  'statusBar.debuggingForeground': '--status-bar-debugging-fg',
  'statusBar.noFolderBackground': '--status-bar-no-folder-bg',
  'statusBar.noFolderForeground': '--status-bar-no-folder-fg',
  'statusBarItem.activeBackground': '--status-bar-item-active-bg',
  'statusBarItem.hoverBackground': '--status-bar-item-hover-bg',
  'statusBarItem.prominentBackground': '--status-bar-item-prominent-bg',
  'statusBarItem.prominentForeground': '--status-bar-item-prominent-fg',
  'statusBarItem.prominentHoverBackground': '--status-bar-item-prominent-hover-bg',
  
  // Tabs and Editor Groups
  'tab.activeBackground': '--tab-active-bg',
  'tab.activeForeground': '--tab-active-fg',
  'tab.activeBorder': '--tab-active-border',
  'tab.activeBorderTop': '--tab-active-border-top',
  'tab.inactiveBackground': '--tab-inactive-bg',
  'tab.inactiveForeground': '--tab-inactive-fg',
  'tab.unfocusedActiveForeground': '--tab-unfocused-active-fg',
  'tab.unfocusedInactiveForeground': '--tab-unfocused-inactive-fg',
  'tab.border': '--tab-border',
  'tab.hoverBackground': '--tab-hover-bg',
  'tab.hoverBorder': '--tab-hover-border',
  'tab.hoverForeground': '--tab-hover-fg',
  'editorGroup.border': '--editor-group-border',
  'editorGroup.dropBackground': '--editor-group-drop-bg',
  'editorGroupHeader.tabsBackground': '--editor-group-header-tabs-bg',
  'editorGroupHeader.tabsBorder': '--editor-group-header-tabs-border',
  'editorGroupHeader.noTabsBackground': '--editor-group-header-no-tabs-bg',
  
  // Input Controls
  'input.background': '--bg-primary',
  'input.foreground': '--text-primary',
  'input.border': '--border-color',
  'input.activeBorder': '--input-active-border',
  'input.placeholderForeground': '--input-placeholder-fg',
  'inputOption.activeBorder': '--input-option-active-border',
  'inputOption.activeBackground': '--input-option-active-bg',
  'inputOption.activeForeground': '--input-option-active-fg',
  'inputValidation.errorBackground': '--input-validation-error-bg',
  'inputValidation.errorForeground': '--input-validation-error-fg',
  'inputValidation.errorBorder': '--input-validation-error-border',
  'inputValidation.infoBackground': '--input-validation-info-bg',
  'inputValidation.infoForeground': '--input-validation-info-fg',
  'inputValidation.infoBorder': '--input-validation-info-border',
  'inputValidation.warningBackground': '--input-validation-warning-bg',
  'inputValidation.warningForeground': '--input-validation-warning-fg',
  'inputValidation.warningBorder': '--input-validation-warning-border',
  
  // Dropdown and Lists
  'dropdown.background': '--dropdown-bg',
  'dropdown.foreground': '--dropdown-fg',
  'dropdown.border': '--dropdown-border',
  'dropdown.listBackground': '--dropdown-list-bg',
  'list.activeSelectionBackground': '--list-active-selection-bg',
  'list.activeSelectionForeground': '--list-active-selection-fg',
  'list.inactiveSelectionBackground': '--list-inactive-selection-bg',
  'list.inactiveSelectionForeground': '--list-inactive-selection-fg',
  'list.hoverBackground': '--list-hover-bg',
  'list.hoverForeground': '--list-hover-fg',
  'list.focusBackground': '--list-focus-bg',
  'list.focusForeground': '--list-focus-fg',
  'list.highlightForeground': '--list-highlight-fg',
  'list.dropBackground': '--list-drop-bg',
  'list.errorForeground': '--list-error-fg',
  'list.warningForeground': '--list-warning-fg',
  
  // Buttons
  'button.background': '--button-bg',
  'button.foreground': '--button-fg',
  'button.hoverBackground': '--button-hover-bg',
  'button.secondaryBackground': '--button-secondary-bg',
  'button.secondaryForeground': '--button-secondary-fg',
  'button.secondaryHoverBackground': '--button-secondary-hover-bg',
  
  // Global UI Elements
  'foreground': '--text-primary',
  'descriptionForeground': '--text-secondary',
  'errorForeground': '--error-fg',
  'focusBorder': '--accent-color',
  'contrastActiveBorder': '--contrast-active-border',
  'contrastBorder': '--contrast-border',
  'selection.background': '--global-selection-bg',
  'widget.shadow': '--widget-shadow',
  'icon.foreground': '--icon-fg',
  
  // Scrollbars
  'scrollbar.shadow': '--scrollbar-shadow',
  'scrollbarSlider.background': '--scrollbar-slider-bg',
  'scrollbarSlider.hoverBackground': '--scrollbar-slider-hover-bg',
  'scrollbarSlider.activeBackground': '--scrollbar-slider-active-bg',
  
  // Badge
  'badge.background': '--badge-bg',
  'badge.foreground': '--badge-fg',
  
  // Progress Bar
  'progressBar.background': '--progress-bar-bg',
  
  // Breadcrumbs
  'breadcrumb.foreground': '--breadcrumb-fg',
  'breadcrumb.background': '--breadcrumb-bg',
  'breadcrumb.focusForeground': '--breadcrumb-focus-fg',
  'breadcrumb.activeSelectionForeground': '--breadcrumb-active-selection-fg',
  'breadcrumbPicker.background': '--breadcrumb-picker-bg',
  
  // Title Bar
  'titleBar.activeBackground': '--title-bar-active-bg',
  'titleBar.activeForeground': '--title-bar-active-fg',
  'titleBar.inactiveBackground': '--title-bar-inactive-bg',
  'titleBar.inactiveForeground': '--title-bar-inactive-fg',
  'titleBar.border': '--title-bar-border',
  
  // Menu Bar
  'menubar.selectionForeground': '--menubar-selection-fg',
  'menubar.selectionBackground': '--menubar-selection-bg',
  'menubar.selectionBorder': '--menubar-selection-border',
  'menu.foreground': '--menu-fg',
  'menu.background': '--menu-bg',
  'menu.selectionForeground': '--menu-selection-fg',
  'menu.selectionBackground': '--menu-selection-bg',
  'menu.selectionBorder': '--menu-selection-border',
  'menu.separatorBackground': '--menu-separator-bg',
  'menu.border': '--menu-border',
  
  // Notifications
  'notificationCenter.border': '--notification-center-border',
  'notificationCenterHeader.foreground': '--notification-center-header-fg',
  'notificationCenterHeader.background': '--notification-center-header-bg',
  'notificationToast.border': '--notification-toast-border',
  'notifications.foreground': '--notifications-fg',
  'notifications.background': '--notifications-bg',
  'notifications.border': '--notifications-border',
  'notificationLink.foreground': '--notification-link-fg',
  
  // Git Decorations
  'gitDecoration.addedResourceForeground': '--git-added-fg',
  'gitDecoration.modifiedResourceForeground': '--git-modified-fg',
  'gitDecoration.deletedResourceForeground': '--git-deleted-fg',
  'gitDecoration.untrackedResourceForeground': '--git-untracked-fg',
  'gitDecoration.ignoredResourceForeground': '--git-ignored-fg',
  'gitDecoration.conflictingResourceForeground': '--git-conflicting-fg',
  'gitDecoration.submoduleResourceForeground': '--git-submodule-fg'
};

// TextMate token scope mapping for enhanced preview support
const textMateMap = {
  // Language constructs
  'entity.name.function': '--textmate-entity-name-function',
  'entity.name.type': '--textmate-entity-name-type',
  'entity.name.class': '--textmate-entity-name-class',
  'entity.name.interface': '--textmate-entity-name-interface',
  'entity.name.namespace': '--textmate-entity-name-namespace',
  'entity.name.label': '--textmate-entity-name-label',
  'entity.name.tag': '--textmate-entity-name-tag',
  'entity.name.section': '--textmate-entity-name-section',
  
  // Support tokens
  'support.type': '--textmate-support-type',
  'support.class': '--textmate-support-class',
  'support.function': '--textmate-support-function',
  'support.method': '--textmate-support-method',
  'support.property': '--textmate-support-property',
  'support.constant': '--textmate-support-constant',
  'support.variable': '--textmate-support-variable',
  'support.other': '--textmate-support-other',
  
  // Variable scopes
  'variable': '--textmate-variable',
  'variable.language': '--textmate-variable-language',
  'variable.parameter': '--textmate-variable-parameter',
  'variable.function': '--textmate-variable-function',
  'variable.other': '--textmate-variable-other',
  'variable.other.constant': '--textmate-variable-other-constant',
  'variable.other.member': '--textmate-variable-other-member',
  'variable.other.property': '--textmate-variable-other-property',
  'variable.other.readwrite': '--textmate-variable-other-readwrite',
  'variable.other.enummember': '--textmate-variable-other-enummember',
  
  // Keywords
  'keyword': '--textmate-keyword',
  'keyword.control': '--textmate-keyword-control',
  'keyword.operator': '--textmate-keyword-operator',
  'keyword.other': '--textmate-keyword-other',
  'keyword.control.conditional': '--textmate-keyword-control-conditional',
  'keyword.control.loop': '--textmate-keyword-control-loop',
  'keyword.control.import': '--textmate-keyword-control-import',
  'keyword.control.export': '--textmate-keyword-control-export',
  
  // Storage (modifiers, types)
  'storage': '--textmate-storage',
  'storage.type': '--textmate-storage-type',
  'storage.modifier': '--textmate-storage-modifier',
  'storage.type.class': '--textmate-storage-type-class',
  'storage.type.function': '--textmate-storage-type-function',
  'storage.type.interface': '--textmate-storage-type-interface',
  'storage.type.enum': '--textmate-storage-type-enum',
  
  // Constants
  'constant': '--textmate-constant',
  'constant.numeric': '--textmate-constant-numeric',
  'constant.language': '--textmate-constant-language',
  'constant.character': '--textmate-constant-character',
  'constant.character.escape': '--textmate-constant-character-escape',
  'constant.other': '--textmate-constant-other',
  'constant.other.color': '--textmate-constant-other-color',
  'constant.other.symbol': '--textmate-constant-other-symbol',
  'constant.other.placeholder': '--textmate-constant-other-placeholder',
  
  // Strings
  'string': '--textmate-string',
  'string.quoted': '--textmate-string-quoted',
  'string.quoted.single': '--textmate-string-quoted-single',
  'string.quoted.double': '--textmate-string-quoted-double',
  'string.quoted.triple': '--textmate-string-quoted-triple',
  'string.unquoted': '--textmate-string-unquoted',
  'string.interpolated': '--textmate-string-interpolated',
  'string.template': '--textmate-string-template',
  'string.regexp': '--textmate-string-regexp',
  'string.other': '--textmate-string-other',
  
  // Comments
  'comment': '--textmate-comment',
  'comment.line': '--textmate-comment-line',
  'comment.block': '--textmate-comment-block',
  'comment.block.documentation': '--textmate-comment-block-documentation',
  
  // Punctuation
  'punctuation': '--textmate-punctuation',
  'punctuation.definition': '--textmate-punctuation-definition',
  'punctuation.separator': '--textmate-punctuation-separator',
  'punctuation.terminator': '--textmate-punctuation-terminator',
  'punctuation.accessor': '--textmate-punctuation-accessor',
  'punctuation.definition.string': '--textmate-punctuation-definition-string',
  'punctuation.definition.comment': '--textmate-punctuation-definition-comment',
  'punctuation.definition.parameters': '--textmate-punctuation-definition-parameters',
  'punctuation.definition.array': '--textmate-punctuation-definition-array',
  'punctuation.definition.block': '--textmate-punctuation-definition-block',
  'punctuation.section.embedded': '--textmate-punctuation-section-embedded',
  
  // Meta scopes
  'meta': '--textmate-meta',
  'meta.class': '--textmate-meta-class',
  'meta.function': '--textmate-meta-function',
  'meta.function-call': '--textmate-meta-function-call',
  'meta.method': '--textmate-meta-method',
  'meta.method-call': '--textmate-meta-method-call',
  'meta.interface': '--textmate-meta-interface',
  'meta.type': '--textmate-meta-type',
  'meta.object-literal': '--textmate-meta-object-literal',
  'meta.object-literal.key': '--textmate-meta-object-literal-key',
  'meta.array': '--textmate-meta-array',
  'meta.block': '--textmate-meta-block',
  'meta.brace': '--textmate-meta-brace',
  'meta.bracket': '--textmate-meta-bracket',
  'meta.parameters': '--textmate-meta-parameters',
  'meta.definition': '--textmate-meta-definition',
  'meta.declaration': '--textmate-meta-declaration',
  'meta.import': '--textmate-meta-import',
  'meta.export': '--textmate-meta-export',
  
  // Markup (HTML, Markdown, etc.)
  'markup': '--textmate-markup',
  'markup.heading': '--textmate-markup-heading',
  'markup.bold': '--textmate-markup-bold',
  'markup.italic': '--textmate-markup-italic',
  'markup.underline': '--textmate-markup-underline',
  'markup.strikethrough': '--textmate-markup-strikethrough',
  'markup.quote': '--textmate-markup-quote',
  'markup.raw': '--textmate-markup-raw',
  'markup.other': '--textmate-markup-other',
  'markup.list': '--textmate-markup-list',
  'markup.list.numbered': '--textmate-markup-list-numbered',
  'markup.list.unnumbered': '--textmate-markup-list-unnumbered',
  'markup.inserted': '--textmate-markup-inserted',
  'markup.deleted': '--textmate-markup-deleted',
  'markup.changed': '--textmate-markup-changed',
  
  // Invalid
  'invalid': '--textmate-invalid',
  'invalid.illegal': '--textmate-invalid-illegal',
  'invalid.deprecated': '--textmate-invalid-deprecated',
  
  // Source language specific
  'source': '--textmate-source',
  'text': '--textmate-text',
  'text.html': '--textmate-text-html',
  'text.xml': '--textmate-text-xml',
  'source.js': '--textmate-source-js',
  'source.ts': '--textmate-source-ts',
  'source.python': '--textmate-source-python',
  'source.java': '--textmate-source-java',
  'source.css': '--textmate-source-css',
  'source.json': '--textmate-source-json',
  'source.yaml': '--textmate-source-yaml',
  
  // Other commonly used scopes
  'entity.other': '--textmate-entity-other',
  'entity.other.attribute-name': '--textmate-entity-other-attribute-name',
  'entity.other.inherited-class': '--textmate-entity-other-inherited-class',
  'source.parameter': '--textmate-source-parameter',
  'beginning.punctuation': '--textmate-beginning-punctuation',
  'ending.punctuation': '--textmate-ending-punctuation'
};

// Global state
let searchQuery = '';
let currentSection = 'workbench';
let visibleItems = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  initializeSearch();
  initializeSectionNavigation();
  initializeTooltips();
  initializeNavigationHelpers();
  initializeSettingNavigation();
  updateVisibleItems();
  
  // Show the main content and hide loading indicator after everything is initialized
  setTimeout(() => {
    const loadingIndicator = document.getElementById('loading-indicator');
    const mainContent = document.getElementById('main-content');
    if (loadingIndicator && mainContent) {
      loadingIndicator.style.display = 'none';
      mainContent.style.display = 'block';
    }
  }, 500);
});

function initializeEventListeners() {
  // Color input synchronization and live updates
  document.addEventListener('input', handleColorInput);

  // Button event listeners
  const resetColorsButton = document.getElementById('resetColors');
  if (resetColorsButton) {
    resetColorsButton.addEventListener('click', handleResetColors);
  }
  const loadEmptyButton = document.getElementById('loadEmptyTheme');
  if (loadEmptyButton) {
    loadEmptyButton.addEventListener('click', handleLoadEmptyTheme);
  }
  const loadCurrentButton = document.getElementById('loadCurrentTheme');
  if (loadCurrentButton) {
    loadCurrentButton.addEventListener('click', handleLoadCurrentTheme);
  }
  const loadThemeButton = document.getElementById('loadTheme');
  if (loadThemeButton) {
    loadThemeButton.addEventListener('click', handleLoadTheme);
  }
  const exportThemeButton = document.getElementById('exportTheme');
  if (exportThemeButton) {
    exportThemeButton.addEventListener('click', handleExportTheme);
  }

  // Category collapse/expand
  document.addEventListener('click', handleCategoryToggle);
}

function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  const debouncedSearch = debounceSearch(handleSearchInput, 200);

  if (searchInput) {
    searchInput.addEventListener('input', debouncedSearch);

    // Handle search keyboard shortcuts
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        focusFirstResult();
      } else if (e.key === 'Escape') {
        clearSearch();
      }
    });
  }
}

function initializeSectionNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const section = this.dataset.section;
      switchSection(section);
    });
  });
}

function handleColorInput(e) {
  const target = e.target;
  if (!target.name) {
    return;
  }
  // Handle alpha slider and number input
  if (target.classList.contains('alpha-slider') || target.classList.contains('alpha-input')) {
    const name = target.name; // e.g. alpha_key or alpha_semantic_key
    // Sync paired alpha inputs
    document.querySelectorAll(`[name="${name}"]`).forEach(input => {
      if (input instanceof HTMLInputElement) {
        input.value = target.value;
      }
    });
    // Compute alpha hex
    const percent = Math.max(0, Math.min(100, parseInt(target.value, 10) || 0));
    const alphaHex = Math.round(percent / 100 * 255).toString(16).padStart(2, '0');
    // Determine associated base name (strip 'alpha_')
    const baseName = name.replace(/^alpha_/, '');
    // Update hex input value
    const hexInput = document.querySelector(`input.hex-input[name="${baseName}"]`);
    const colorPicker = document.querySelector(`input.color-picker[name="${baseName}"]`);
    if (hexInput && colorPicker) {
      const baseHex = colorPicker.value; // '#RRGGBB'
      const newHex = baseHex + alphaHex;
      hexInput.value = newHex;
      // Notify extension and preview update
      applyLiveUpdate(baseName, newHex);
    }
    return;
  }
  // Process color picker and hex input
  if (!target.classList.contains('color-picker') && !target.classList.contains('hex-input')) {
    return;
  }

  const name = target.name;
  let value = target.value;

  // Validate hex input
  if (target.classList.contains('hex-input')) {
    if (!value.startsWith('#')) {
      value = '#' + value;
    }
    if (!/^#[0-9a-fA-F]{6,8}$/.test(value)) {
      target.classList.add('invalid');
      return;
    } else {
      target.classList.remove('invalid');
    }
  }

  // Sync paired inputs (color picker <-> hex input)
  const pairedInputs = document.querySelectorAll(`[name="${name}"]`);
  pairedInputs.forEach(input => {
    if (input !== target && input instanceof HTMLInputElement) {
      input.value = value; // Ensure input is an HTMLInputElement
      input.classList.remove('invalid');
    }
  });
  // Update alpha inputs based on hex value
  // Determine hex string length
  let alphaPercent = 100;
  if (target.classList.contains('hex-input')) {
    const hexVal = value;
    if (/^#[0-9a-fA-F]{8}$/.test(hexVal)) {
      const a = parseInt(hexVal.slice(7, 9), 16);
      alphaPercent = Math.round(a / 255 * 100);
    }
    // Sync alpha controls
    const alphaName = `alpha_${name}`;
    document.querySelectorAll(`input.alpha-slider[name="${alphaName}"], input.alpha-input[name="${alphaName}"]`).forEach(inp => {
      if (inp instanceof HTMLInputElement) inp.value = alphaPercent.toString();
    });
  }

  // Apply live update to VS Code and preview
  applyLiveUpdate(name, value);
}

// Throttling and batching for better performance
let updateThrottle;
let batchUpdateQueue = new Map();
let searchDebounce;

function debounceSearch(func, delay) {
  return function(...args) {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => func.apply(this, args), delay);
  };
}

function throttleUpdate(key, value) {
  batchUpdateQueue.set(key, value);

  if (updateThrottle) {
    clearTimeout(updateThrottle);
  }

  updateThrottle = setTimeout(() => {
    const changes = Array.from(batchUpdateQueue.entries()).map(([k, v]) => ({ key: k, value: v }));
    batchUpdateQueue.clear();

    if (changes.length === 1) {
      vscode.postMessage({
        type: 'liveUpdate',
        key: changes[0].key,
        value: changes[0].value
      });
    } else {
      vscode.postMessage({
        type: 'batchUpdate',
        changes: changes
      });
    }

    // Update local preview for all changes
    changes.forEach(change => {
      updatePreviewColors(change.key, change.value);
      showColorUpdateFeedback(change.key);
    });
  }, 150); // 150ms throttle for UI responsiveness
}

function applyLiveUpdate(key, value) {
  // Use throttled update for better performance
  throttleUpdate(key, value);
}

function previewColor(key, value) {
  // Send preview message to VS Code
  vscode.postMessage({
    type: 'previewColor',
    key: key,
    value: value
  });

  // Update local preview immediately
  updatePreviewColors(key, value);
}

function updatePreviewColors(key, value) {
  // Handle semantic token colors for preview
  if (key.startsWith('semantic_')) {
    const semanticKey = key.replace('semantic_', '');
    const cssProperty = semanticMap[semanticKey];
    if (cssProperty) {
      document.documentElement.style.setProperty(cssProperty, value);
    }
    return;
  }

  // Handle TextMate token colors for preview with enhanced mapping
  if (key.startsWith('textmate_')) {
    const scope = key.replace('textmate_', '');
    
    // Try exact match first
    if (textMateMap[scope]) {
      document.documentElement.style.setProperty(textMateMap[scope], value);
      return;
    }
    
    // Fallback to generic CSS variable for unmapped scopes
    const cssVar = `--textmate-${scope.replace(/\./g, '-').replace(/:/g, '-')}`;
    document.documentElement.style.setProperty(cssVar, value);
    return;
  }

  // Handle UI workbench color changes by mapping to CSS variables
  if (uiMap[key]) {
    document.documentElement.style.setProperty(uiMap[key], value);
  } else if (!key.startsWith('semantic_') && !key.startsWith('textmate_') && !key.startsWith('token_')) {
    // Generic mapping for any other workbench color key to VSCode CSS var
    const varName = `--vscode-${key.replace(/\./g, '-')}`;
    document.documentElement.style.setProperty(varName, value);
  }
  // Handle workbench colors preview specifically for code snippet
  const previewElement = document.querySelector('.code-preview');
  if (previewElement instanceof HTMLElement) {
    if (key === 'editor.background') {
      previewElement.style.backgroundColor = value;
    }
    if (key === 'editor.foreground') {
      previewElement.style.color = value;
    }
  }
}

function showColorUpdateFeedback(key) {
  // Find the color item and add visual feedback
  const colorItem = document.querySelector(`[name="${key}"]`)?.closest('.color-item');
  if (colorItem) {
    colorItem.classList.add('updated');
    setTimeout(() => {
      colorItem.classList.remove('updated');
    }, 300);
  }
}

function handleSearchInput(e) {
  searchQuery = e.target.value.toLowerCase();
  filterColorItems();
  updateSearchCount();
}

function filterColorItems() {
  const colorItems = document.querySelectorAll('.color-item');
  visibleItems = [];

  colorItems.forEach(item => {
    const searchText = (item instanceof HTMLElement ? item.dataset.search : '') || '';
    const isVisible = !searchQuery || searchText.includes(searchQuery);

    if (item instanceof HTMLElement) {
      item.style.display = isVisible ? 'flex' : 'none';
    }

    if (isVisible) {
      visibleItems.push(item);
      highlightSearchTerms(item, searchQuery);
    }
  });

  // Show/hide categories based on visible items
  updateCategoryVisibility();
}

function highlightSearchTerms(item, query) {
  if (!query) return;

  const label = item.querySelector('.color-label');
  const description = item.querySelector('.color-description');

  [label, description].forEach(el => {
    if (el && el.textContent) {
      const text = el.textContent;
      const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
      const highlightedText = text.replace(regex, '<mark>$1</mark>');
      if (highlightedText !== text) {
        el.innerHTML = highlightedText;
      }
    }
  });
}

function updateCategoryVisibility() {
  const categories = document.querySelectorAll('.color-category');
  categories.forEach(category => {
    const visibleItems = category.querySelectorAll('.color-item[style*="flex"], .color-item:not([style*="none"])');
    if (category instanceof HTMLElement) {
      category.style.display = visibleItems.length > 0 ? 'block' : 'none';
    }
  });
}

function updateSearchCount() {
  const searchCount = document.getElementById('searchCount');
  if (searchCount) { // Add null check
    if (searchQuery) {
      searchCount.textContent = `${visibleItems.length} results`;
      searchCount.style.display = 'inline';
    } else {
      searchCount.style.display = 'none';
    }
  }
}

function focusFirstResult() {
  if (visibleItems.length > 0) {
    const firstInput = visibleItems[0].querySelector('.color-picker, .hex-input');
    if (firstInput) {
      firstInput.focus();
    }
  }
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput instanceof HTMLInputElement) {
    searchInput.value = '';
    searchQuery = '';
    filterColorItems();
    updateSearchCount();
    searchInput.focus();
  }
}

function switchSection(section) {
  // Update navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn instanceof HTMLElement && btn.dataset.section === section);
  });

  // Update content sections
  document.querySelectorAll('.color-section').forEach(sect => {
    sect.classList.toggle('active', sect.id === `${section}-section`);
  });

  currentSection = section;
  updateVisibleItems();
}

function updateVisibleItems() {
  // Re-run search filter for current section
  filterColorItems();
}

function handleCategoryToggle(e) {
  const categoryTitle = e.target.closest('.category-title');
  if (!categoryTitle) return;

  const category = categoryTitle.closest('.color-category');
  const content = category.querySelector('.category-content');
  const icon = categoryTitle.querySelector('.category-icon');

  const isCollapsed = content.style.display === 'none';
  content.style.display = isCollapsed ? 'block' : 'none';
  icon.textContent = isCollapsed ? '▼' : '▶';

  categoryTitle.classList.toggle('collapsed', !isCollapsed);
}

function handleResetColors() {
  const confirmed = confirm('This will reset all custom colors to default. Continue?');
  if (confirmed) {
    vscode.postMessage({ type: 'resetColors' });
    showNotification('Colors reset to default', 'info');
  }
}

function handleLoadEmptyTheme() {
  const confirmed = confirm('This will load an empty theme with white/transparent colors. Continue?');
  if (confirmed) {
    vscode.postMessage({ type: 'loadEmptyTheme' });
    showNotification('Empty theme loaded', 'info');
  }
}

function handleLoadCurrentTheme() {
  const confirmed = confirm('This will load the current theme. Continue?');
  if (confirmed) {
    vscode.postMessage({ type: 'loadCurrentTheme' });
    showNotification('Current theme loaded', 'info');
  }
}

function handleLoadTheme() {
  vscode.postMessage({ type: 'loadTheme' });
}

function handleExportTheme() {
  vscode.postMessage({ type: 'exportTheme' });
}

// Template management functions
function handleReloadTemplate() {
  const confirmed = confirm('This will reload the template from TEMPLATE.jsonc. Continue?');
  if (confirmed) {
    vscode.postMessage({ type: 'reloadTemplate' });
    showNotification('Reloading template...', 'info');
  }
}

function handleSyncTemplate() {
  const confirmed = confirm('This will sync all template elements with the current UI. Continue?');
  if (confirmed) {
    vscode.postMessage({ type: 'syncTemplate' });
    showNotification('Syncing template with UI...', 'info');
  }
}

function updateTemplateElement(category, key, value, applyImmediately = false) {
  vscode.postMessage({
    type: 'updateTemplateElement',
    category,
    key,
    value,
    applyImmediately
  });
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Handle messages from VS Code
// Handle messages from the extension
window.addEventListener('message', function(event) {
  const message = event.data;
  // Handle full theme refresh
  if (message.type === 'refreshTheme' && message.theme) {
    const theme = message.theme;
    // Apply workbench colors
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        updatePreviewColors(key, value);
      });
    }
    // Apply semantic token colors
    if (theme.semanticTokenColors) {
      Object.entries(theme.semanticTokenColors).forEach(([key, value]) => {
        updatePreviewColors(`semantic_${key}`, value);
      });
    }
    // Apply TextMate token colors
    if (Array.isArray(theme.tokenColors)) {
      theme.tokenColors.forEach((token, index) => {
        if (token.settings && token.settings.foreground) {
          updatePreviewColors(`token_${index}`, token.settings.foreground);
        }
      });
    }
    return;
  }
  // Update specific input values on live edits
  if (message.type === 'themeChanged') {
    // set input values and update preview
    document.querySelectorAll(`[name="${message.key}"]`).forEach(el => {
      if (el instanceof HTMLInputElement) el.value = message.value;
    });
    updatePreviewColors(message.key, message.value);
    return;
  }

  switch (message.type) {
    case 'searchResults':
      // Handle search results from VS Code
      break;
    case 'toggleSectionResult':
      // Handle section toggle results
      break;
    case 'themeLoaded':
      showNotification('Theme loaded successfully', 'success');
      break;
    case 'themeExported':
      showNotification('Theme exported successfully', 'success');
      break;
    case 'error':
      showNotification(message.message, 'error');
      break;
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + F: Focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
    e.preventDefault();
    const searchEl = document.getElementById('searchInput');
    if (searchEl instanceof HTMLInputElement) {
      searchEl.focus();
    }
  }

  // Ctrl/Cmd + R: Reset colors
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault();
    handleResetColors();
  }

  // Ctrl/Cmd + E: Export theme
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    handleExportTheme();
  }

  // Tab navigation between sections
  if (e.key === 'Tab' && e.target instanceof HTMLElement && e.target.classList.contains('nav-btn')) {
    // Allow normal tab behavior but could enhance
  }
});

// Auto-save functionality (save state periodically)
let autoSaveTimer;
function scheduleAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    // Could implement auto-save of current theme state
    console.log('Auto-save triggered');
  }, 5000);
}

// Call scheduleAutoSave on any color change
document.addEventListener('input', function(e) {
  if (e.target instanceof HTMLElement && (e.target.classList.contains('color-picker') || e.target.classList.contains('hex-input'))) {
    scheduleAutoSave();
  }
});

// Handle messages from the extension
// Secondary listener for update and batch messages
window.addEventListener('message', event => {
  const message = event.data;
  switch (message.type) {
    case 'refreshTheme':
      const theme = message.theme;
      if (theme) {
        // Apply all workbench colors
        Object.entries(theme.colors || {}).forEach(([k, v]) => updatePreviewColors(k, v));
        // Apply semantic tokens
        Object.entries(theme.semanticTokenColors || {}).forEach(([k, v]) => updatePreviewColors(`semantic_${k}`, v));
        // Apply TextMate token colors
        if (Array.isArray(theme.tokenColors)) {
          theme.tokenColors.forEach((token, i) => token.settings?.foreground && updatePreviewColors(`token_${i}`, token.settings.foreground));
        }
      }
      break;
    case 'updateSuccess':
      showSuccessFeedback(`Updated ${message.changes.length} colors`);
      break;

    case 'updateError':
      showErrorFeedback(`Update failed: ${message.error}`);
      break;

    case 'batchUpdateSuccess':
      showSuccessFeedback(`Batch updated ${message.changes.length} colors`);
      break;

    case 'batchUpdateError':
      showErrorFeedback(`Batch update failed: ${message.error}`);
      break;

    case 'previewSuccess':
      showPreviewFeedback(message.key, message.value);
      break;

    case 'previewError':
      showErrorFeedback(`Preview failed for ${message.key}: ${message.error}`);
      break;

    // Template management messages
    case 'templateReloaded':
      showSuccessFeedback(`Template reloaded: ${message.stats.total} elements loaded`);
      break;

    case 'templateReloadError':
      showErrorFeedback(`Template reload failed: ${message.error}`);
      break;

    case 'templateElementUpdated':
      const action = message.applied ? 'updated and applied' : 'updated';
      showSuccessFeedback(`Template element ${message.category}.${message.key} ${action}`);
      break;

    case 'templateElementUpdateError':
      showErrorFeedback(`Failed to update template element ${message.category}.${message.key}: ${message.error}`);
      break;

    case 'templateSynced':
      showSuccessFeedback('Template synced with UI');
      break;

    case 'templateSyncError':
      showErrorFeedback(`Failed to sync template: ${message.error}`);
      break;
  }
});

function showSuccessFeedback(message) {
  const feedback = document.createElement('div');
  feedback.classList.add('feedback', 'success');
  feedback.textContent = message;
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 2000);
}

function showErrorFeedback(message) {
  const feedback = document.createElement('div');
  feedback.classList.add('feedback', 'error');
  feedback.textContent = message;
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 3000);
}

function showPreviewFeedback(key, value) {
  const feedback = document.createElement('div');
  feedback.classList.add('feedback', 'preview');
  feedback.textContent = `Previewing ${key}: ${value}`;
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.remove();
  }, 1500);
}

// ==========================================
// TOOLTIP SYSTEM
// ==========================================

function initializeTooltips() {
  // Initialize tooltips for status badges and other elements
  document.addEventListener('mouseenter', handleTooltipShow, true);
  document.addEventListener('mouseleave', handleTooltipHide, true);
  document.addEventListener('focus', handleTooltipShow, true);
  document.addEventListener('blur', handleTooltipHide, true);
}

function handleTooltipShow(event) {
  const element = event.target;
  if (!element.hasAttribute('data-tooltip')) return;

  const tooltipText = element.getAttribute('data-tooltip');
  const tooltipClass = element.getAttribute('data-tooltip-class') || '';
  
  showTooltip(element, tooltipText, tooltipClass);
}

function handleTooltipHide(event) {
  const element = event.target;
  if (!element.hasAttribute('data-tooltip')) return;
  
  hideTooltip();
}

let currentTooltip = null;

function showTooltip(element, text, className = '') {
  // Remove existing tooltip
  hideTooltip();

  const tooltip = document.createElement('div');
  tooltip.className = `tooltip ${className}`;
  tooltip.textContent = text;
  
  document.body.appendChild(tooltip);
  currentTooltip = tooltip;

  // Position tooltip
  const rect = element.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  
  // Default to bottom positioning
  let top = rect.bottom + 8;
  let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
  
  // Check if tooltip would go off screen and adjust
  if (left < 8) left = 8;
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8;
  }
  
  // If tooltip would go below viewport, show above element
  if (top + tooltipRect.height > window.innerHeight - 8) {
    top = rect.top - tooltipRect.height - 8;
    tooltip.classList.add('tooltip-top');
  } else {
    tooltip.classList.add('tooltip-bottom');
  }
  
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  
  // Show with animation
  requestAnimationFrame(() => {
    tooltip.classList.add('show');
  });
}

function hideTooltip() {
  if (currentTooltip) {
    currentTooltip.classList.remove('show');
    setTimeout(() => {
      if (currentTooltip && currentTooltip.parentNode) {
        currentTooltip.parentNode.removeChild(currentTooltip);
      }
      currentTooltip = null;
    }, 200);
  }
}

// ==========================================
// NAVIGATION & EXAMPLE HELPERS
// ==========================================

function initializeNavigationHelpers() {
  // Add event listeners for navigation buttons
  document.addEventListener('click', handleNavigationClick);
  
  // Initialize legend popup
  initializeLegendPopup();
}

function initializeLegendPopup() {
  const legendTrigger = document.getElementById('legendTrigger');
  const legend = document.querySelector('.ui-legend');
  
  if (legendTrigger && legend) {
    legendTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      legend.classList.toggle('show');
    });
    
    // Close legend when clicking outside
    document.addEventListener('click', function(e) {
      if (!legend.contains(e.target) && !legendTrigger.contains(e.target)) {
        legend.classList.remove('show');
      }
    });
    
    // Close legend on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && legend.classList.contains('show')) {
        legend.classList.remove('show');
      }
    });
  }
}

function handleNavigationClick(event) {
  const navBtn = event.target.closest('.navigate-btn');
  if (!navBtn) return;
  
  event.preventDefault();
  const target = navBtn.getAttribute('data-navigate-to');
  
  if (target) {
    navigateToSetting(target);
  }
}

function navigateToSetting(settingKey) {
  // Send message to VS Code to navigate to setting
  vscode.postMessage({
    type: 'navigateToSetting',
    setting: settingKey
  });
  
  // Show feedback
  showNotification(`Navigating to ${settingKey} setting...`, 'info');
}

// ==========================================
// LEGEND GENERATION
// ==========================================

function createLegend() {
  return `
    <div class="ui-legend">
      <h3>Visual Indicators Guide</h3>
      <div class="legend-grid">
        <div class="legend-item">
          <span class="legend-icon">⚙️</span>
          <div class="legend-text">
            <strong>Setting Required</strong><br>
            Item needs a specific VS Code setting enabled to take effect
          </div>
        </div>
        <div class="legend-item">
          <span class="legend-icon">👁️</span>
          <div class="legend-text">
            <strong>Opacity Supported</strong><br>
            Item supports transparency/alpha channel values
          </div>
        </div>
        <div class="legend-item">
          <span class="legend-icon">📝</span>
          <div class="legend-text">
            <strong>TextMate Token</strong><br>
            Syntax highlighting token controlled by TextMate grammar
          </div>
        </div>
        <div class="legend-item">
          <span class="legend-icon">🔒</span>
          <div class="legend-text">
            <strong>Read-only</strong><br>
            Item is informational or controlled by other settings
          </div>
        </div>
        <div class="legend-item">
          <span class="legend-icon">📍</span>
          <div class="legend-text">
            <strong>Navigate</strong><br>
            Click to jump to the related VS Code setting
          </div>
        </div>
        <div class="legend-item">
          <span class="legend-icon">🎨</span>
          <div class="legend-text">
            <strong>Preview</strong><br>
            Live preview of how the color appears in VS Code
          </div>
        </div>
      </div>
    </div>
  `;
}

// Helper function to get tooltip content for different elements
function getTooltipContent(element, type) {
  switch (type) {
    case 'setting-required':
      const setting = element.getAttribute('data-setting');
      return `Requires "${setting}" setting to be enabled in VS Code preferences`;
      
    case 'opacity-required':
      return 'This color supports transparency. Use 8-digit hex values (#RRGGBBAA) or adjust the opacity slider';
      
    case 'textmate-readonly':
      return 'TextMate syntax token - controlled by language grammar rules and theme token mappings';
      
    case 'navigate':
      const target = element.getAttribute('data-navigate-to');
      return `Click to open ${target} in VS Code settings`;
      
    default:
      return element.getAttribute('data-tooltip') || '';
  }
}

// Navigation and highlighting functionality for setting badges
function initializeSettingNavigation() {
  // Handle setting badge clicks
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('setting-name')) {
      const settingName = e.target.getAttribute('data-setting');
      if (settingName) {
        // Highlight the setting name visually
        highlightSettingUsage(settingName);
        
        // Send message to VS Code to open the setting
        vscode.postMessage({
          type: 'openSetting',
          setting: settingName
        });
      }
    }
  });
}

// Highlight all items controlled by a specific setting
function highlightSettingUsage(settingName) {
  // Remove any existing highlights
  document.querySelectorAll('.color-item.highlight-target').forEach(item => {
    item.classList.remove('highlight-target');
  });
  
  // Find and highlight all items with this setting
  const matchingBadges = document.querySelectorAll(`[data-setting="${settingName}"]`);
  matchingBadges.forEach(badge => {
    const colorItem = badge.closest('.color-item');
    if (colorItem) {
      colorItem.classList.add('highlight-target');
      
      // Scroll to first highlighted item
      if (matchingBadges[0] === badge) {
        colorItem.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  });
  
  // Remove highlights after 3 seconds
  setTimeout(() => {
    document.querySelectorAll('.color-item.highlight-target').forEach(item => {
      item.classList.remove('highlight-target');
    });
  }, 3000);
}
