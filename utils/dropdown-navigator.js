// Advanced dropdown navigation helpers for complex interactions
export class DropdownNavigator {
  constructor() {
    this.initializeSelectors();
    this.currentlyOpenDropdown = null;
    this.searchTimeout = null;
  }

  initializeSelectors() {
    // Common selectors for different dropdown types
    this.dropdownSelectors = {
      // Standard HTML selects
      standard: 'select',
      
      // Custom dropdowns (common patterns)
      custom: [
        '[role="listbox"]',
        '[role="combobox"]',
        '.dropdown',
        '.select',
        '.selectize',
        '.chosen-container',
        '.ui-selectmenu',
        '.ant-select',
        '.el-select',
        '.v-select',
        '[data-toggle="dropdown"]'
      ],
      
      // Bootstrap dropdowns
      bootstrap: [
        '.dropdown-toggle',
        '.btn-group .dropdown-toggle'
      ],
      
      // Material UI
      materialUI: [
        '.MuiSelect-root',
        '.MuiAutocomplete-root',
        '[role="combobox"][aria-haspopup="listbox"]'
      ],
      
      // React Select
      reactSelect: [
        '.react-select__control',
        '.Select-control'
      ],
      
      // Vue.js dropdowns
      vue: [
        '.v-select',
        '.vue-select'
      ],
      
      // Angular dropdowns
      angular: [
        'mat-select',
        'ng-select',
        '[ng-model][ng-options]'
      ],
      
      // Searchable dropdowns
      searchable: [
        'input[role="combobox"]',
        'input[aria-autocomplete]',
        '.typeahead',
        '.autocomplete',
        '.search-select'
      ]
    };

    // Option selectors for different dropdown types
    this.optionSelectors = {
      standard: 'option',
      custom: [
        '[role="option"]',
        '.dropdown-item',
        '.select-option',
        '.option',
        '.item',
        'li[data-value]',
        '[data-option-value]'
      ],
      materialUI: [
        '.MuiMenuItem-root',
        '[role="option"]'
      ],
      bootstrap: [
        '.dropdown-item',
        '.dropdown-menu li a'
      ]
    };
  }

  /**
   * Detect dropdown type and get appropriate handlers
   * @param {HTMLElement} element - The dropdown element
   * @returns {Object} Dropdown info with type and handlers
   */
  analyzeDropdown(element) {
    const tagName = element.tagName.toLowerCase();
    const className = element.className || '';
    const role = element.getAttribute('role') || '';
    const ariaHaspopup = element.getAttribute('aria-haspopup') || '';

    let dropdownType = 'unknown';
    let isSearchable = false;
    let isMultiLevel = false;
    let isVirtualized = false;

    // Determine dropdown type
    if (tagName === 'select') {
      dropdownType = 'standard';
    } else if (role === 'combobox' || role === 'listbox') {
      dropdownType = 'custom';
      isSearchable = element.hasAttribute('aria-autocomplete');
    } else if (className.includes('react-select')) {
      dropdownType = 'react-select';
      isSearchable = true;
    } else if (className.includes('MuiSelect') || className.includes('MuiAutocomplete')) {
      dropdownType = 'material-ui';
      isSearchable = className.includes('MuiAutocomplete');
    } else if (className.includes('bootstrap') || className.includes('dropdown')) {
      dropdownType = 'bootstrap';
    } else if (className.includes('v-select') || className.includes('vue-select')) {
      dropdownType = 'vue';
      isSearchable = true;
    } else if (element.hasAttribute('ng-model') || className.includes('ng-select')) {
      dropdownType = 'angular';
    } else {
      // Try to detect based on structure
      dropdownType = this.detectCustomDropdownType(element);
    }

    // Check for multi-level (nested options)
    isMultiLevel = this.hasNestedOptions(element);

    // Check for virtualization
    isVirtualized = this.isVirtualizedDropdown(element);

    return {
      type: dropdownType,
      element: element,
      isSearchable: isSearchable,
      isMultiLevel: isMultiLevel,
      isVirtualized: isVirtualized,
      role: role,
      ariaHaspopup: ariaHaspopup
    };
  }

  detectCustomDropdownType(element) {
    const parent = element.closest('.dropdown, .select, .selectize, .chosen-container');
    if (parent) {
      if (parent.className.includes('selectize')) return 'selectize';
      if (parent.className.includes('chosen')) return 'chosen';
      return 'custom';
    }
    return 'unknown';
  }

  hasNestedOptions(element) {
    // Look for nested option structures
    const nestedSelectors = [
      '.dropdown-submenu',
      '.has-children',
      '.nested-options',
      '[aria-haspopup="menu"]'
    ];
    
    return nestedSelectors.some(selector => 
      element.querySelector(selector) !== null
    );
  }

  isVirtualizedDropdown(element) {
    // Check for common virtualization libraries
    const virtualizationClasses = [
      'react-window',
      'react-virtualized',
      'virtual-list',
      'RecyclerListView'
    ];
    
    return virtualizationClasses.some(cls => 
      element.className.includes(cls) || 
      element.querySelector(`.${cls}`) !== null
    );
  }

  /**
   * Open a dropdown using the appropriate method
   * @param {Object} dropdownInfo - Dropdown analysis result
   * @returns {Promise<boolean>} Success status
   */
  async openDropdown(dropdownInfo) {
    const { type, element, isSearchable } = dropdownInfo;
    
    try {
      switch (type) {
        case 'standard':
          return this.openStandardSelect(element);
        
        case 'react-select':
          return this.openReactSelect(element);
        
        case 'material-ui':
          return this.openMaterialUISelect(element);
        
        case 'bootstrap':
          return this.openBootstrapDropdown(element);
        
        case 'vue':
          return this.openVueSelect(element);
        
        case 'angular':
          return this.openAngularSelect(element);
        
        case 'custom':
        default:
          return this.openCustomDropdown(element);
      }
    } catch (error) {
      console.error('Failed to open dropdown:', error);
      return false;
    }
  }

  async openStandardSelect(element) {
    try {
      element.focus();
      
      // Try to programmatically open using showPicker (modern browsers)
      if (element.showPicker) {
        element.showPicker();
        return true;
      }
      
      // Fallback: simulate click
      element.click();
      return true;
    } catch (error) {
      console.warn('Standard select open failed:', error);
      return false;
    }
  }

  async openReactSelect(element) {
    // React Select usually opens on click of the control
    const control = element.querySelector('.react-select__control') || element;
    
    control.focus();
    control.click();
    
    // Wait for dropdown to appear
    await this.waitForElement('.react-select__menu', 1000);
    return true;
  }

  async openMaterialUISelect(element) {
    // Material UI selects usually have a specific trigger
    const trigger = element.querySelector('[role="button"]') || element;
    
    trigger.focus();
    trigger.click();
    
    // Wait for menu to appear
    await this.waitForElement('.MuiPaper-root[role="listbox"], .MuiMenu-paper', 1000);
    return true;
  }

  async openBootstrapDropdown(element) {
    const toggle = element.querySelector('[data-bs-toggle="dropdown"], [data-toggle="dropdown"]') || element;
    
    toggle.focus();
    toggle.click();
    
    // Wait for dropdown menu
    await this.waitForElement('.dropdown-menu.show', 1000);
    return true;
  }

  async openVueSelect(element) {
    const trigger = element.querySelector('.vs__search') || element.querySelector('.v-select') || element;
    
    trigger.focus();
    trigger.click();
    
    // Wait for dropdown
    await this.waitForElement('.vs__dropdown-menu, .v-select__menu', 1000);
    return true;
  }

  async openAngularSelect(element) {
    element.focus();
    element.click();
    
    // For Angular Material
    if (element.tagName.toLowerCase() === 'mat-select') {
      await this.waitForElement('.mat-select-panel', 1000);
    } else {
      // For ng-select
      await this.waitForElement('.ng-dropdown-panel', 1000);
    }
    
    return true;
  }

  async openCustomDropdown(element) {
    // Generic approach for custom dropdowns
    const trigger = element.querySelector('[role="button"], .trigger, .toggle') || element;
    
    trigger.focus();
    trigger.click();
    
    // Try multiple ways to trigger opening
    const events = ['mousedown', 'click', 'focus'];
    for (const eventType of events) {
      trigger.dispatchEvent(new MouseEvent(eventType, { bubbles: true }));
    }
    
    // Wait for any dropdown-like element to appear
    await this.waitForElement('[role="listbox"], .dropdown-menu, .options, .menu', 1000);
    return true;
  }

  /**
   * Find all options in an open dropdown
   * @param {Object} dropdownInfo - Dropdown analysis result
   * @returns {Array} Array of option elements with metadata
   */
  async getDropdownOptions(dropdownInfo) {
    const { type, element, isVirtualized } = dropdownInfo;
    
    if (isVirtualized) {
      return this.getVirtualizedOptions(element);
    }
    
    let options = [];
    
    switch (type) {
      case 'standard':
        options = Array.from(element.querySelectorAll('option')).map(opt => ({
          element: opt,
          text: opt.textContent.trim(),
          value: opt.value,
          disabled: opt.disabled,
          selected: opt.selected
        }));
        break;
      
      case 'react-select':
        options = await this.getReactSelectOptions();
        break;
      
      case 'material-ui':
        options = await this.getMaterialUIOptions();
        break;
      
      case 'bootstrap':
        options = await this.getBootstrapOptions();
        break;
      
      default:
        options = await this.getCustomDropdownOptions(element);
    }
    
    return options;
  }

  async getReactSelectOptions() {
    const menu = document.querySelector('.react-select__menu');
    if (!menu) return [];
    
    return Array.from(menu.querySelectorAll('.react-select__option')).map(opt => ({
      element: opt,
      text: opt.textContent.trim(),
      value: opt.getAttribute('data-value') || opt.textContent.trim(),
      disabled: opt.classList.contains('react-select__option--is-disabled'),
      focused: opt.classList.contains('react-select__option--is-focused')
    }));
  }

  async getMaterialUIOptions() {
    const menu = document.querySelector('.MuiPaper-root[role="listbox"], .MuiMenu-paper');
    if (!menu) return [];
    
    return Array.from(menu.querySelectorAll('.MuiMenuItem-root')).map(opt => ({
      element: opt,
      text: opt.textContent.trim(),
      value: opt.getAttribute('data-value') || opt.textContent.trim(),
      disabled: opt.classList.contains('Mui-disabled'),
      selected: opt.classList.contains('Mui-selected')
    }));
  }

  async getBootstrapOptions() {
    const menu = document.querySelector('.dropdown-menu.show');
    if (!menu) return [];
    
    return Array.from(menu.querySelectorAll('.dropdown-item')).map(opt => ({
      element: opt,
      text: opt.textContent.trim(),
      value: opt.getAttribute('data-value') || opt.textContent.trim(),
      disabled: opt.classList.contains('disabled'),
      active: opt.classList.contains('active')
    }));
  }

  async getCustomDropdownOptions(rootElement) {
    // Try common option selectors
    const selectors = [
      '[role="option"]',
      '.option',
      '.dropdown-item',
      '.select-option',
      '.item',
      'li[data-value]',
      '.menu-item'
    ];
    
    for (const selector of selectors) {
      const options = document.querySelectorAll(selector);
      if (options.length > 0) {
        return Array.from(options).map(opt => ({
          element: opt,
          text: opt.textContent.trim(),
          value: opt.getAttribute('data-value') || opt.getAttribute('value') || opt.textContent.trim(),
          disabled: opt.hasAttribute('disabled') || opt.classList.contains('disabled'),
          selected: opt.hasAttribute('selected') || opt.classList.contains('selected')
        }));
      }
    }
    
    return [];
  }

  async getVirtualizedOptions(element) {
    // For virtualized dropdowns, we need to scroll to reveal all options
    // This is a complex topic and would require specific handling for each library
    console.warn('Virtualized dropdown detection - advanced handling needed');
    return [];
  }

  /**
   * Select an option in the dropdown
   * @param {Object} dropdownInfo - Dropdown analysis result
   * @param {Object} option - Option to select
   * @returns {Promise<boolean>} Success status
   */
  async selectOption(dropdownInfo, option) {
    const { type, isSearchable } = dropdownInfo;
    
    try {
      if (isSearchable) {
        return this.selectSearchableOption(dropdownInfo, option);
      }
      
      switch (type) {
        case 'standard':
          return this.selectStandardOption(option);
        
        case 'react-select':
          return this.selectReactSelectOption(option);
        
        case 'material-ui':
          return this.selectMaterialUIOption(option);
        
        case 'bootstrap':
          return this.selectBootstrapOption(option);
        
        default:
          return this.selectCustomOption(option);
      }
    } catch (error) {
      console.error('Failed to select option:', error);
      return false;
    }
  }

  async selectStandardOption(option) {
    option.element.selected = true;
    option.element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  async selectReactSelectOption(option) {
    option.element.click();
    await this.waitForCondition(() => !document.querySelector('.react-select__menu'), 1000);
    return true;
  }

  async selectMaterialUIOption(option) {
    option.element.click();
    await this.waitForCondition(() => !document.querySelector('.MuiPaper-root[role="listbox"]'), 1000);
    return true;
  }

  async selectBootstrapOption(option) {
    option.element.click();
    await this.waitForCondition(() => !document.querySelector('.dropdown-menu.show'), 1000);
    return true;
  }

  async selectCustomOption(option) {
    // Try various click methods
    option.element.click();
    option.element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    option.element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    return true;
  }

  /**
   * Handle searchable dropdowns by typing the desired value
   * @param {Object} dropdownInfo - Dropdown analysis result
   * @param {Object} targetOption - Option to search for
   * @returns {Promise<boolean>} Success status
   */
  async selectSearchableOption(dropdownInfo, targetOption) {
    const { element, type } = dropdownInfo;
    
    // Find the search input
    let searchInput = null;
    
    switch (type) {
      case 'react-select':
        searchInput = element.querySelector('.react-select__input input') || 
                     element.querySelector('input[role="combobox"]');
        break;
      
      case 'material-ui':
        searchInput = element.querySelector('input[role="combobox"]') ||
                     element.querySelector('.MuiAutocomplete-input');
        break;
      
      case 'vue':
        searchInput = element.querySelector('.vs__search') ||
                     element.querySelector('.v-select input');
        break;
      
      default:
        searchInput = element.querySelector('input[role="combobox"]') ||
                     element.querySelector('input[aria-autocomplete]') ||
                     element.querySelector('.search, .typeahead, .autocomplete');
    }
    
    if (!searchInput) {
      console.warn('Could not find search input for searchable dropdown');
      return false;
    }
    
    // Clear existing value and type new value
    searchInput.focus();
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Type the target text character by character
    const targetText = targetOption.text || targetOption.value;
    await this.typeInInput(searchInput, targetText);
    
    // Wait for filtered options to appear
    await this.waitForCondition(() => {
      const options = document.querySelectorAll('[role="option"]');
      return Array.from(options).some(opt => 
        opt.textContent.trim().toLowerCase().includes(targetText.toLowerCase())
      );
    }, 2000);
    
    // Find and click the matching option
    const matchingOption = Array.from(document.querySelectorAll('[role="option"]'))
      .find(opt => opt.textContent.trim().toLowerCase() === targetText.toLowerCase());
    
    if (matchingOption) {
      matchingOption.click();
      return true;
    }
    
    // Fallback: press Enter if exact match not found
    searchInput.dispatchEvent(new KeyboardEvent('keydown', { 
      key: 'Enter', 
      keyCode: 13, 
      bubbles: true 
    }));
    
    return true;
  }

  /**
   * Type text into an input with realistic timing
   * @param {HTMLElement} input - Input element
   * @param {string} text - Text to type
   * @returns {Promise<void>}
   */
  async typeInInput(input, text) {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      input.value += char;
      
      // Dispatch input events
      input.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keyup', { key: char, bubbles: true }));
      
      // Small delay between characters for realism
      await this.sleep(50);
    }
  }

  /**
   * Navigate multi-level dropdown menus
   * @param {Object} dropdownInfo - Dropdown analysis result
   * @param {Array} path - Array of option texts/values representing the path
   * @returns {Promise<boolean>} Success status
   */
  async navigateMultiLevel(dropdownInfo, path) {
    if (!dropdownInfo.isMultiLevel) {
      console.warn('Dropdown is not multi-level');
      return false;
    }
    
    let currentLevel = 0;
    
    for (const pathItem of path) {
      // Find options at current level
      const options = await this.getDropdownOptions(dropdownInfo);
      const targetOption = options.find(opt => 
        opt.text.toLowerCase().includes(pathItem.toLowerCase()) ||
        opt.value.toLowerCase().includes(pathItem.toLowerCase())
      );
      
      if (!targetOption) {
        console.warn(`Could not find option "${pathItem}" at level ${currentLevel}`);
        return false;
      }
      
      // If this is the last item in path, select it
      if (currentLevel === path.length - 1) {
        return this.selectOption(dropdownInfo, targetOption);
      }
      
      // Otherwise, hover/click to reveal next level
      targetOption.element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      targetOption.element.click();
      
      // Wait for submenu to appear
      await this.sleep(300);
      currentLevel++;
    }
    
    return false;
  }

  /**
   * Close an open dropdown
   * @param {Object} dropdownInfo - Dropdown analysis result
   * @returns {Promise<boolean>} Success status
   */
  async closeDropdown(dropdownInfo) {
    try {
      // Try pressing Escape first (universal method)
      document.dispatchEvent(new KeyboardEvent('keydown', { 
        key: 'Escape', 
        keyCode: 27, 
        bubbles: true 
      }));
      
      // Wait a bit and check if dropdown closed
      await this.sleep(200);
      
      // If still open, try clicking outside
      const dropdownElement = document.querySelector('.dropdown-menu, [role="listbox"], .select-dropdown');
      if (dropdownElement) {
        document.body.click();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to close dropdown:', error);
      return false;
    }
  }

  // Utility methods
  async waitForElement(selector, timeout = 5000) {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  async waitForCondition(condition, timeout = 5000) {
    return new Promise((resolve) => {
      if (condition()) {
        resolve(true);
        return;
      }
      
      const interval = setInterval(() => {
        if (condition()) {
          clearInterval(interval);
          resolve(true);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(interval);
        resolve(false);
      }, timeout);
    });
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}