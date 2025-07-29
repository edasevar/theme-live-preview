# Template Update Capabilities

The Theme Editor Live extension now includes comprehensive capabilities for handling template element updates. This ensures that the extension can dynamically manage and update theme template elements while maintaining consistency between the template file and active theme configurations.

## 🚀 Key Features

### 1. Template Reloading
- **Method**: `themeManager.reloadTemplate()`
- **Command**: `Theme Editor: Reload Template from TEMPLATE.jsonc`
- **Purpose**: Reload template elements from the TEMPLATE.jsonc file
- **Use Case**: When the template file is modified externally

```typescript
// Programmatic usage
await themeManager.reloadTemplate();
```

### 2. Template Element Updates
- **Method**: `themeManager.updateTemplateElement(category, key, value, applyImmediately)`
- **Purpose**: Update individual template elements in memory
- **Categories**: `'colors'`, `'semanticTokenColors'`, `'tokenColors'`

```typescript
// Update workbench color template element
await themeManager.updateTemplateElement(
    'colors',
    'editor.background',
    '#001122',
    false // Don't apply immediately
);

// Update semantic token and apply to current theme
await themeManager.updateTemplateElement(
    'semanticTokenColors',
    'variable',
    '#ff6600',
    true // Apply immediately
);

// Update TextMate token with full settings
await themeManager.updateTemplateElement(
    'tokenColors',
    'comment',
    { foreground: '#888888', fontStyle: 'italic' },
    false
);
```

### 3. Template-UI Synchronization
- **Method**: `themeManager.syncTemplateWithUI()`
- **Command**: `Theme Editor: Sync Template with UI`
- **Purpose**: Ensure UI reflects current template state
- **Effect**: Emits change events for all template elements

```typescript
// Sync template changes with UI
themeManager.syncTemplateWithUI();
```

### 4. Template Statistics
- **Method**: `themeManager.getTemplateStats()`
- **Command**: `Theme Editor: Show Template Statistics`
- **Returns**: Object with element counts by category

```typescript
const stats = themeManager.getTemplateStats();
console.log(`Total elements: ${stats.total}`);
console.log(`Colors: ${stats.colors}`);
console.log(`Semantic Tokens: ${stats.semanticTokenColors}`);
console.log(`TextMate Tokens: ${stats.tokenColors}`);
```

## 📡 Message-Based Updates

The webview supports message-based template updates for UI integration:

### Message Types

#### Reload Template
```javascript
vscode.postMessage({ type: 'reloadTemplate' });
```

#### Update Template Element
```javascript
vscode.postMessage({
    type: 'updateTemplateElement',
    category: 'colors',
    key: 'editor.background',
    value: '#001122',
    applyImmediately: false
});
```

#### Sync Template
```javascript
vscode.postMessage({ type: 'syncTemplate' });
```

### Response Messages

#### Template Reloaded
```javascript
{
    type: 'templateReloaded',
    stats: { colors: 100, semanticTokenColors: 50, tokenColors: 200, total: 350 }
}
```

#### Template Element Updated
```javascript
{
    type: 'templateElementUpdated',
    category: 'colors',
    key: 'editor.background',
    value: '#001122',
    applied: false
}
```

#### Template Synced
```javascript
{
    type: 'templateSynced'
}
```

## 🛠️ UI Integration

The extension provides JavaScript functions for UI controls:

```javascript
// Template management functions
function handleReloadTemplate() {
    vscode.postMessage({ type: 'reloadTemplate' });
}

function handleSyncTemplate() {
    vscode.postMessage({ type: 'syncTemplate' });
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
```

## 🎯 Use Cases

### 1. Dynamic Theme Generation
Create tools that automatically update template elements based on user preferences or external data sources.

### 2. Template Development Workflow
During template development, reload templates automatically when files change, ensuring the UI always reflects the latest template structure.

### 3. Theme Inheritance Systems
Build systems where themes inherit from base templates, with programmatic updates to specific elements.

### 4. Automated Theme Testing
Create automated tests that validate template elements and their application to active themes.

### 5. Real-time Template Validation
Monitor template statistics and validate element counts to ensure template integrity.

## 🔧 Error Handling

All template update operations include comprehensive error handling:

- **Template Reload Errors**: File not found, parsing errors, permission issues
- **Element Update Errors**: Invalid categories, malformed values, application failures
- **Sync Errors**: UI state inconsistencies, event emission failures

Error messages are propagated to both the console and VS Code's notification system for user feedback.

## 🧪 Testing

Use the provided test file to validate template update capabilities:

```bash
# Run the template update test
node test-template-updates.js
```

The test covers:
- Template reloading from file
- Individual element updates
- Template-UI synchronization
- Statistics retrieval
- Programmatic API usage

## 🎉 Benefits

### For Extension Users
- **Reliability**: Template changes are consistently applied and synchronized
- **Transparency**: Clear feedback about template operations through notifications
- **Control**: Commands available through Command Palette for manual operations

### For Extension Developers
- **Flexibility**: Programmatic API for automated template management
- **Consistency**: Guaranteed synchronization between template and UI state
- **Monitoring**: Real-time statistics and validation capabilities
- **Integration**: Message-based communication for webview integration

### For Theme Authors
- **Development Workflow**: Automatic template reloading during development
- **Validation**: Template statistics help ensure complete theme coverage
- **Testing**: Programmatic updates enable automated theme testing workflows

The template update capabilities ensure that Theme Editor Live can handle complex template management scenarios while maintaining a consistent and reliable user experience.
