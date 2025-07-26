/* global acquireVsCodeApi */
const vscode = acquireVsCodeApi();

// Semantic token mapping for live preview
const semanticMap = {
  "keyword": "--token-keyword",
  "function": "--token-function",
  "parameter": "--token-parameter",
  "string": "--token-string",
  "comment": "--token-comment",
  "type": "--token-type",
  "property": "--token-property",
  "class": "--token-class",
  "variable": "--token-variable",
  "number": "--token-number",
  "operator": "--token-operator",
  "punctuation": "--token-punctuation"
};

// UI color mapping to CSS variables
const uiMap = {
  'editor.background': '--bg-primary',
  'editor.foreground': '--text-primary',
  'sideBar.background': '--bg-secondary',
  'sideBar.foreground': '--text-primary',
  'sideBar.border': '--border-color',
  'panel.background': '--bg-secondary',
  'panel.border': '--border-color',
  'panelInput.border': '--border-color',
  'descriptionForeground': '--text-secondary',
  'focusBorder': '--accent-color',
  'input.background': '--bg-primary',
  'input.foreground': '--text-primary',
  'input.border': '--border-color'
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
  updateVisibleItems();
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

  // Handle UI workbench color changes by mapping to CSS variables
  if (uiMap[key]) {
    document.documentElement.style.setProperty(uiMap[key], value);
  } else if (!key.startsWith('semantic_') && !key.startsWith('token_')) {
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
