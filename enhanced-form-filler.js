// Enhanced Form Filler - Master Integration
// This file demonstrates how all the MCQ/dropdown enhancement components work together

import { OptionMatcher } from './utils/option-matcher.js';
import { OptionMapper } from './utils/option-mapper.js';
import { DropdownNavigator } from './utils/dropdown-navigator.js';
import { EnhancedProfile } from './utils/enhanced-profile.js';
import { GeminiAPI } from './utils/smart filler.js';

export class EnhancedFormFiller {
  constructor(options = {}) {
    this.optionMatcher = new OptionMatcher();
    this.optionMapper = new OptionMapper();
    this.dropdownNavigator = new DropdownNavigator();
    this.geminiAPI = new GeminiAPI();
    
    this.config = {
      useAI: options.useAI !== false,
      confidenceThreshold: options.confidenceThreshold || 0.7,
      enablePreview: options.enablePreview !== false,
      maxRetries: options.maxRetries || 3,
      debugMode: options.debugMode || false
    };
    
    this.enhancedProfile = null;
    this.fillResults = [];
  }

  /**
   * Initialize with user profile data
   * @param {Object} profileData - Raw profile data
   */
  async initialize(profileData) {
    if (this.config.debugMode) {
      console.log('Initializing Enhanced Form Filler with profile:', profileData);
    }

    // Create enhanced profile with normalization and inference
    this.enhancedProfile = new EnhancedProfile(profileData);
    
    if (this.config.debugMode) {
      console.log('Enhanced profile created:', this.enhancedProfile.export('flat'));
      console.log('Profile keywords:', this.enhancedProfile.exportKeywords());
    }
  }

  /**
   * Main form filling method with comprehensive MCQ/dropdown support
   * @param {Object} options - Filling options
   * @returns {Object} Comprehensive filling results
   */
  async fillForm(options = {}) {
    if (!this.enhancedProfile) {
      throw new Error('Form filler not initialized. Call initialize() first.');
    }

    const startTime = performance.now();
    this.fillResults = [];

    try {
      // Step 1: Detect all form fields
      const allFields = await this.detectAllFields();
      console.log(`Detected ${allFields.length} form fields`);

      // Step 2: Categorize fields by type
      const categorizedFields = this.categorizeFields(allFields);
      console.log('Field categories:', Object.keys(categorizedFields).map(k => `${k}: ${categorizedFields[k].length}`));

      // Step 3: Fill different field types using appropriate strategies
      const results = {
        textFields: await this.fillTextFields(categorizedFields.text || []),
        dropdowns: await this.fillDropdownFields(categorizedFields.dropdown || []),
        radioButtons: await this.fillRadioFields(categorizedFields.radio || []),
        checkboxes: await this.fillCheckboxFields(categorizedFields.checkbox || []),
        searchableSelects: await this.fillSearchableFields(categorizedFields.searchable || [])
      };

      // Step 4: Compile comprehensive results
      const totalFields = allFields.length;
      const totalFilled = Object.values(results).reduce((sum, category) => sum + category.filled, 0);
      const endTime = performance.now();

      const comprehensiveResults = {
        success: true,
        summary: {
          totalFields: totalFields,
          totalFilled: totalFilled,
          fillRate: Math.round((totalFilled / totalFields) * 100),
          duration: Math.round(endTime - startTime),
          confidenceAverage: this.calculateAverageConfidence()
        },
        categoryResults: results,
        detailedResults: this.fillResults,
        profileUsage: this.analyzeProfileUsage(),
        recommendations: this.generateRecommendations()
      };

      if (this.config.debugMode) {
        console.log('Comprehensive filling results:', comprehensiveResults);
      }

      return comprehensiveResults;

    } catch (error) {
      console.error('Form filling failed:', error);
      return {
        success: false,
        error: error.message,
        summary: { totalFields: 0, totalFilled: 0, fillRate: 0 }
      };
    }
  }

  /**
   * Detect all form fields with enhanced categorization
   * @returns {Array} All detected form fields
   */
  async detectAllFields() {
    const fields = [];

    // Standard form elements
    const standardSelectors = [
      'input[type="text"]',
      'input[type="email"]', 
      'input[type="tel"]',
      'input[type="url"]',
      'input[type="search"]',
      'input[type="number"]',
      'input[type="date"]',
      'input:not([type])',
      'textarea',
      'select'
    ];

    // Radio buttons and checkboxes
    const choiceSelectors = [
      'input[type="radio"]',
      'input[type="checkbox"]'
    ];

    // Custom/modern form elements
    const modernSelectors = [
      '[role="combobox"]',
      '[role="listbox"]',
      '[contenteditable="true"]',
      '.react-select',
      '.v-select',
      '.ant-select',
      'mat-select',
      'ng-select'
    ];

    // Collect standard form fields
    for (const selector of standardSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isFieldVisible(element) && !this.isFieldDisabled(element)) {
          const fieldInfo = this.extractDetailedFieldInfo(element);
          if (fieldInfo) fields.push(fieldInfo);
        }
      });
    }

    // Collect choice fields (radio/checkbox)
    for (const selector of choiceSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isFieldVisible(element)) {
          const fieldInfo = this.extractChoiceFieldInfo(element);
          if (fieldInfo) fields.push(fieldInfo);
        }
      });
    }

    // Collect modern/custom form elements
    for (const selector of modernSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (this.isFieldVisible(element)) {
          const fieldInfo = this.extractModernFieldInfo(element);
          if (fieldInfo) fields.push(fieldInfo);
        }
      });
    }

    return fields;
  }

  /**
   * Extract comprehensive field information
   * @param {HTMLElement} element - Form element
   * @returns {Object} Detailed field information
   */
  extractDetailedFieldInfo(element) {
    const baseInfo = {
      element: element,
      id: element.id || '',
      name: element.name || '',
      type: element.type || element.tagName.toLowerCase(),
      placeholder: element.placeholder || '',
      label: this.getFieldLabel(element),
      ariaLabel: element.getAttribute('aria-label') || '',
      autocomplete: element.getAttribute('autocomplete') || '',
      required: element.required || element.hasAttribute('required'),
      className: element.className || '',
      tagName: element.tagName.toLowerCase()
    };

    // Enhanced field analysis
    baseInfo.fieldType = this.inferFieldType(baseInfo);
    baseInfo.expectedFormat = this.inferExpectedFormat(baseInfo);
    baseInfo.context = this.inferFieldContext(element);
    baseInfo.priority = this.calculateFieldPriority(baseInfo);

    // For select elements, extract options
    if (element.tagName.toLowerCase() === 'select') {
      baseInfo.options = Array.from(element.options).map(opt => ({
        value: opt.value,
        text: opt.textContent.trim(),
        selected: opt.selected,
        disabled: opt.disabled
      }));
    }

    return baseInfo;
  }

  /**
   * Extract choice field information (radio/checkbox)
   * @param {HTMLElement} element - Choice element
   * @returns {Object} Choice field information
   */
  extractChoiceFieldInfo(element) {
    const baseInfo = this.extractDetailedFieldInfo(element);
    
    // Group related choices
    if (element.type === 'radio') {
      const relatedRadios = document.querySelectorAll(`input[type="radio"][name="${element.name}"]`);
      baseInfo.options = Array.from(relatedRadios).map(radio => ({
        value: radio.value,
        text: this.getChoiceLabel(radio),
        checked: radio.checked,
        element: radio
      }));
      baseInfo.isGroup = relatedRadios.length > 1;
    }

    baseInfo.checked = element.checked;
    baseInfo.value = element.value;
    baseInfo.choiceLabel = this.getChoiceLabel(element);

    return baseInfo;
  }

  /**
   * Extract modern/custom field information
   * @param {HTMLElement} element - Modern form element
   * @returns {Object} Modern field information
   */
  extractModernFieldInfo(element) {
    const baseInfo = this.extractDetailedFieldInfo(element);
    
    // Analyze modern dropdown types
    const dropdownInfo = this.dropdownNavigator.analyzeDropdown(element);
    baseInfo.dropdownType = dropdownInfo.type;
    baseInfo.isSearchable = dropdownInfo.isSearchable;
    baseInfo.isMultiLevel = dropdownInfo.isMultiLevel;
    baseInfo.isVirtualized = dropdownInfo.isVirtualized;

    return baseInfo;
  }

  /**
   * Categorize fields by type for appropriate handling
   * @param {Array} fields - All detected fields
   * @returns {Object} Categorized fields
   */
  categorizeFields(fields) {
    const categories = {
      text: [],
      dropdown: [],
      radio: [],
      checkbox: [],
      searchable: [],
      unknown: []
    };

    for (const field of fields) {
      if (field.type === 'radio') {
        categories.radio.push(field);
      } else if (field.type === 'checkbox') {
        categories.checkbox.push(field);
      } else if (field.tagName === 'select' || field.dropdownType) {
        if (field.isSearchable) {
          categories.searchable.push(field);
        } else {
          categories.dropdown.push(field);
        }
      } else if (['text', 'email', 'tel', 'url', 'search', 'number', 'date', 'textarea'].includes(field.type)) {
        categories.text.push(field);
      } else {
        categories.unknown.push(field);
      }
    }

    return categories;
  }

  /**
   * Fill text-based fields
   * @param {Array} textFields - Text fields to fill
   * @returns {Object} Text filling results
   */
  async fillTextFields(textFields) {
    let filled = 0;
    const results = [];

    for (const field of textFields) {
      try {
        const value = await this.findBestValueForField(field);
        if (value && value.confidence >= this.config.confidenceThreshold) {
          const success = await this.fillTextField(field, value.value);
          if (success) {
            filled++;
            results.push({
              field: field,
              value: value.value,
              confidence: value.confidence,
              method: value.method,
              success: true
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fill text field ${field.name}:`, error);
        results.push({
          field: field,
          error: error.message,
          success: false
        });
      }
    }

    this.fillResults.push(...results);
    return { filled, total: textFields.length, results };
  }

  /**
   * Fill dropdown fields with intelligent option matching
   * @param {Array} dropdownFields - Dropdown fields to fill
   * @returns {Object} Dropdown filling results
   */
  async fillDropdownFields(dropdownFields) {
    let filled = 0;
    const results = [];

    for (const field of dropdownFields) {
      try {
        // Use enhanced option matching
        let bestMatch = null;

        // Try option mapper first for specific field types
        const fieldType = this.inferSpecificFieldType(field);
        if (fieldType !== 'generic') {
          const userValue = this.extractUserValueForFieldType(fieldType);
          if (userValue) {
            const mapperResult = this.optionMapper.mapToOption(userValue, field.options, fieldType);
            if (mapperResult.confidence > 0.6) {
              bestMatch = mapperResult;
              bestMatch.method = 'option-mapper';
            }
          }
        }

        // Fallback to general option matcher
        if (!bestMatch) {
          const matcherResult = await this.optionMatcher.findBestMatch(
            field, 
            this.enhancedProfile.export('flat'),
            { useAI: this.config.useAI }
          );
          if (matcherResult.confidence > 0.5) {
            bestMatch = matcherResult;
            bestMatch.method = 'option-matcher';
          }
        }

        // AI-powered matching as last resort
        if (!bestMatch && this.config.useAI) {
          try {
            const aiResult = await this.geminiAPI.analyzeMCQOptions(
              field.label || field.name,
              field.options,
              { domain: window.location.hostname },
              this.enhancedProfile.export('flat')
            );
            
            if (aiResult.confidence > 0.4) {
              bestMatch = {
                option: field.options.find(opt => opt.text === aiResult.selectedValue),
                confidence: aiResult.confidence,
                reasoning: aiResult.reasoning,
                method: 'ai-analysis'
              };
            }
          } catch (aiError) {
            console.warn('AI analysis failed for dropdown:', aiError);
          }
        }

        if (bestMatch && bestMatch.option) {
          const success = await this.selectDropdownOption(field, bestMatch.option);
          if (success) {
            filled++;
            results.push({
              field: field,
              selectedOption: bestMatch.option,
              confidence: bestMatch.confidence,
              method: bestMatch.method,
              reasoning: bestMatch.reasoning,
              success: true
            });
          }
        } else {
          results.push({
            field: field,
            message: 'No suitable option found',
            success: false
          });
        }

      } catch (error) {
        console.error(`Failed to fill dropdown field ${field.name}:`, error);
        results.push({
          field: field,
          error: error.message,
          success: false
        });
      }
    }

    this.fillResults.push(...results);
    return { filled, total: dropdownFields.length, results };
  }

  /**
   * Fill radio button groups
   * @param {Array} radioFields - Radio fields to fill
   * @returns {Object} Radio filling results
   */
  async fillRadioFields(radioFields) {
    let filled = 0;
    const results = [];

    // Group radio buttons by name
    const radioGroups = this.groupRadioButtons(radioFields);

    for (const [groupName, radios] of Object.entries(radioGroups)) {
      try {
        const representativeField = radios[0];
        const question = {
          label: representativeField.label,
          name: groupName,
          options: representativeField.options
        };

        const bestMatch = await this.optionMatcher.findBestMatch(
          question,
          this.enhancedProfile.export('flat'),
          { useAI: this.config.useAI }
        );

        if (bestMatch.option && bestMatch.confidence >= this.config.confidenceThreshold) {
          const success = await this.selectRadioOption(bestMatch.option);
          if (success) {
            filled++;
            results.push({
              group: groupName,
              selectedOption: bestMatch.option,
              confidence: bestMatch.confidence,
              success: true
            });
          }
        }

      } catch (error) {
        console.error(`Failed to fill radio group ${groupName}:`, error);
        results.push({
          group: groupName,
          error: error.message,
          success: false
        });
      }
    }

    this.fillResults.push(...results);
    return { filled, total: Object.keys(radioGroups).length, results };
  }

  /**
   * Fill checkbox fields
   * @param {Array} checkboxFields - Checkbox fields to fill  
   * @returns {Object} Checkbox filling results
   */
  async fillCheckboxFields(checkboxFields) {
    let filled = 0;
    const results = [];

    for (const field of checkboxFields) {
      try {
        const shouldCheck = await this.determineCheckboxState(field);
        
        if (shouldCheck.decision !== null) {
          const success = await this.setCheckboxState(field, shouldCheck.decision);
          if (success) {
            filled++;
            results.push({
              field: field,
              checked: shouldCheck.decision,
              confidence: shouldCheck.confidence,
              reasoning: shouldCheck.reasoning,
              success: true
            });
          }
        }

      } catch (error) {
        console.error(`Failed to fill checkbox ${field.name}:`, error);
        results.push({
          field: field,
          error: error.message,
          success: false
        });
      }
    }

    this.fillResults.push(...results);
    return { filled, total: checkboxFields.length, results };
  }

  /**
   * Fill searchable select fields
   * @param {Array} searchableFields - Searchable select fields
   * @returns {Object} Searchable filling results
   */
  async fillSearchableFields(searchableFields) {
    let filled = 0;
    const results = [];

    for (const field of searchableFields) {
      try {
        const dropdownInfo = this.dropdownNavigator.analyzeDropdown(field.element);
        
        // Open the dropdown to get available options
        await this.dropdownNavigator.openDropdown(dropdownInfo);
        const options = await this.dropdownNavigator.getDropdownOptions(dropdownInfo);
        
        if (options.length > 0) {
          // Find best match
          const fieldWithOptions = { ...field, options };
          const bestMatch = await this.optionMatcher.findBestMatch(
            fieldWithOptions,
            this.enhancedProfile.export('flat'),
            { useAI: this.config.useAI }
          );

          if (bestMatch.option && bestMatch.confidence >= this.config.confidenceThreshold) {
            const success = await this.dropdownNavigator.selectSearchableOption(dropdownInfo, bestMatch.option);
            if (success) {
              filled++;
              results.push({
                field: field,
                selectedOption: bestMatch.option,
                confidence: bestMatch.confidence,
                success: true
              });
            }
          }
        }

      } catch (error) {
        console.error(`Failed to fill searchable field ${field.name}:`, error);
        results.push({
          field: field,
          error: error.message,
          success: false
        });
      }
    }

    this.fillResults.push(...results);
    return { filled, total: searchableFields.length, results };
  }

  // Helper methods for field analysis and value extraction

  inferFieldType(fieldInfo) {
    const label = (fieldInfo.label || '').toLowerCase();
    const name = (fieldInfo.name || '').toLowerCase();
    const id = (fieldInfo.id || '').toLowerCase();
    const combinedText = `${label} ${name} ${id}`;

    // Common field type patterns
    const patterns = {
      'firstName': ['first name', 'fname', 'given name', 'forename'],
      'lastName': ['last name', 'lname', 'surname', 'family name'],
      'email': ['email', 'e-mail', 'mail'],
      'phone': ['phone', 'telephone', 'mobile', 'cell'],
      'address': ['address', 'street', 'location'],
      'city': ['city', 'town'],
      'state': ['state', 'province', 'region'],
      'country': ['country', 'nation'],
      'zipCode': ['zip', 'postal', 'postcode'],
      'company': ['company', 'employer', 'organization'],
      'jobTitle': ['job title', 'position', 'role'],
      'dateOfBirth': ['birth date', 'dob', 'birthday'],
      'age': ['age'],
      'gender': ['gender', 'sex'],
      'education': ['education', 'degree', 'school'],
      'industry': ['industry', 'sector']
    };

    for (const [fieldType, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return fieldType;
      }
    }

    return 'unknown';
  }

  inferSpecificFieldType(field) {
    // Map to option mapper field types
    const typeMap = {
      'country': 'country',
      'state': 'state', 
      'industry': 'industry',
      'education': 'education',
      'language': 'language',
      'age': 'numeric',
      'income': 'numeric'
    };

    const baseType = this.inferFieldType(field);
    return typeMap[baseType] || 'generic';
  }

  extractUserValueForFieldType(fieldType) {
    const profile = this.enhancedProfile.export('flat');

    const fieldMap = {
      'country': profile['address.country'],
      'state': profile['address.state'],
      'industry': profile['employment.industry'],
      'education': profile['education.level'],
      'language': profile['skills.primaryLanguage']
    };

    return fieldMap[fieldType];
  }

  async findBestValueForField(field) {
    const fieldType = this.inferFieldType(field);
    const profile = this.enhancedProfile.export('flat');

    // Direct field mapping
    const directMappings = {
      'firstName': profile['identity.firstName'],
      'lastName': profile['identity.lastName'],
      'email': profile['contact.email'],
      'phone': profile['contact.phone'],
      'address': profile['address.street'],
      'city': profile['address.city'],
      'state': profile['address.state'],
      'country': profile['address.country'],
      'zipCode': profile['address.zipCode'],
      'company': profile['employment.company'],
      'jobTitle': profile['employment.jobTitle']
    };

    const directValue = directMappings[fieldType];
    if (directValue) {
      return {
        value: directValue,
        confidence: 0.9,
        method: 'direct-mapping'
      };
    }

    // Use profile search for more complex matching
    const searchResults = this.enhancedProfile.searchFields(field.label || field.name);
    if (searchResults.length > 0 && searchResults[0].score > 0.5) {
      return {
        value: searchResults[0].matches?.[0] || '',
        confidence: searchResults[0].score,
        method: 'profile-search'
      };
    }

    return { value: null, confidence: 0, method: 'none' };
  }

  // Additional helper methods
  isFieldVisible(element) {
    return element.offsetParent !== null && 
           !element.hidden && 
           element.style.display !== 'none' &&
           element.style.visibility !== 'hidden';
  }

  isFieldDisabled(element) {
    return element.disabled || element.readOnly;
  }

  getFieldLabel(element) {
    // Implementation similar to existing getFieldLabel method
    return element.labels?.[0]?.textContent?.trim() || 
           element.placeholder || 
           element.getAttribute('aria-label') || 
           '';
  }

  getChoiceLabel(element) {
    const label = element.labels?.[0];
    if (label) return label.textContent.trim();

    const nextSibling = element.nextElementSibling;
    if (nextSibling && nextSibling.tagName === 'LABEL') {
      return nextSibling.textContent.trim();
    }

    return element.value || '';
  }

  calculateFieldPriority(fieldInfo) {
    let priority = 0;
    
    if (fieldInfo.required) priority += 3;
    if (fieldInfo.type === 'email') priority += 2;
    if (fieldInfo.label.includes('name')) priority += 2;
    if (fieldInfo.autocomplete) priority += 1;
    
    return priority;
  }

  inferFieldContext(element) {
    const form = element.closest('form');
    if (!form) return 'standalone';
    
    const formClasses = form.className.toLowerCase();
    const formId = form.id.toLowerCase();
    
    if (formClasses.includes('signup') || formId.includes('signup')) return 'registration';
    if (formClasses.includes('login') || formId.includes('login')) return 'authentication';
    if (formClasses.includes('checkout') || formId.includes('checkout')) return 'ecommerce';
    if (formClasses.includes('contact') || formId.includes('contact')) return 'contact';
    
    return 'general';
  }

  inferExpectedFormat(fieldInfo) {
    if (fieldInfo.type === 'email') return 'email';
    if (fieldInfo.type === 'tel') return 'phone';
    if (fieldInfo.type === 'url') return 'url';
    if (fieldInfo.type === 'date') return 'date';
    if (fieldInfo.type === 'number') return 'number';
    
    return 'text';
  }

  groupRadioButtons(radioFields) {
    const groups = {};
    
    for (const field of radioFields) {
      const groupName = field.name || 'unnamed-group';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(field);
    }
    
    return groups;
  }

  async determineCheckboxState(field) {
    const label = (field.label || field.choiceLabel || '').toLowerCase();
    
    // Common checkbox patterns and their expected states based on profile
    const preferences = this.enhancedProfile.profile.preferences;
    
    if (label.includes('newsletter')) {
      return {
        decision: preferences.privacy.newsletter,
        confidence: 0.8,
        reasoning: 'Based on newsletter preference'
      };
    }
    
    if (label.includes('marketing') || label.includes('promotional')) {
      return {
        decision: preferences.privacy.marketing,
        confidence: 0.8,
        reasoning: 'Based on marketing preference'
      };
    }
    
    if (label.includes('terms') || label.includes('agreement')) {
      return {
        decision: true, // Usually required
        confidence: 0.9,
        reasoning: 'Terms typically required for form submission'
      };
    }
    
    return { decision: null, confidence: 0, reasoning: 'No clear preference pattern' };
  }

  // Form interaction methods
  async fillTextField(field, value) {
    try {
      const element = field.element;
      element.focus();
      element.value = value;
      
      // Trigger events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      return true;
    } catch (error) {
      console.error('Failed to fill text field:', error);
      return false;
    }
  }

  async selectDropdownOption(field, option) {
    try {
      const element = field.element;
      
      if (element.tagName.toLowerCase() === 'select') {
        element.value = option.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      
      // Handle modern dropdowns
      const dropdownInfo = this.dropdownNavigator.analyzeDropdown(element);
      return await this.dropdownNavigator.selectOption(dropdownInfo, option);
      
    } catch (error) {
      console.error('Failed to select dropdown option:', error);
      return false;
    }
  }

  async selectRadioOption(option) {
    try {
      const element = option.element;
      element.checked = true;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('click', { bubbles: true }));
      return true;
    } catch (error) {
      console.error('Failed to select radio option:', error);
      return false;
    }
  }

  async setCheckboxState(field, checked) {
    try {
      const element = field.element;
      element.checked = checked;
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new Event('click', { bubbles: true }));
      return true;
    } catch (error) {
      console.error('Failed to set checkbox state:', error);
      return false;
    }
  }

  // Analysis and reporting methods
  calculateAverageConfidence() {
    const confidences = this.fillResults
      .filter(result => result.confidence)
      .map(result => result.confidence);
    
    return confidences.length > 0 
      ? Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100) / 100
      : 0;
  }

  analyzeProfileUsage() {
    const usedFields = new Set();
    const fieldTypes = {};
    
    for (const result of this.fillResults) {
      if (result.success && result.method) {
        usedFields.add(result.method);
        
        const fieldType = this.inferFieldType(result.field);
        fieldTypes[fieldType] = (fieldTypes[fieldType] || 0) + 1;
      }
    }
    
    return {
      methodsUsed: Array.from(usedFields),
      fieldTypesFilled: fieldTypes,
      profileUtilization: Math.round((usedFields.size / 6) * 100) // Assuming 6 main methods
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Analyze failures and suggest improvements
    const failures = this.fillResults.filter(r => !r.success);
    if (failures.length > 0) {
      recommendations.push({
        type: 'profile_enhancement',
        message: `Consider adding more profile data to improve matching for ${failures.length} unfilled fields`,
        fields: failures.map(f => f.field?.name || 'unknown').slice(0, 5)
      });
    }
    
    // Check confidence levels
    const lowConfidence = this.fillResults.filter(r => r.confidence && r.confidence < 0.6);
    if (lowConfidence.length > 0) {
      recommendations.push({
        type: 'data_quality',
        message: 'Some fields were filled with low confidence. Consider reviewing and updating profile data',
        count: lowConfidence.length
      });
    }
    
    // AI usage recommendation
    if (!this.config.useAI && failures.length > 2) {
      recommendations.push({
        type: 'ai_enhancement',
        message: 'Enable AI assistance to improve matching for complex fields',
        potentialImprovement: Math.round((failures.length / this.fillResults.length) * 100)
      });
    }
    
    return recommendations;
  }

  // Public utility methods
  getProfileSuggestions() {
    return this.optionMapper.getProfileSuggestions(this.enhancedProfile.export('flat'));
  }

  async runDiagnostics() {
    if (!this.enhancedProfile) {
      return { error: 'Profile not initialized' };
    }
    
    const allFields = await this.detectAllFields();
    const categorizedFields = this.categorizeFields(allFields);
    
    return {
      profileHealth: {
        completeness: this.enhancedProfile.profile.computed.confidenceScores,
        keywords: this.enhancedProfile.exportKeywords(),
        categoryTags: this.enhancedProfile.profile.computed.categoryTags
      },
      formAnalysis: {
        totalFields: allFields.length,
        fieldCategories: Object.keys(categorizedFields).map(k => ({
          category: k,
          count: categorizedFields[k].length
        })),
        complexFields: allFields.filter(f => f.dropdownType || f.isSearchable).length
      },
      recommendations: this.getProfileSuggestions()
    };
  }
}

// Usage example and integration helper
export class FormFillerIntegration {
  constructor() {
    this.formFiller = null;
  }

  async initializeForPage(profileData) {
    this.formFiller = new EnhancedFormFiller({
      useAI: true,
      confidenceThreshold: 0.7,
      enablePreview: true,
      debugMode: false
    });
    
    await this.formFiller.initialize(profileData);
    return this.formFiller;
  }

  async demonstrateCapabilities() {
    if (!this.formFiller) {
      throw new Error('Form filler not initialized');
    }
    
    console.log('Running diagnostics...');
    const diagnostics = await this.formFiller.runDiagnostics();
    console.log('Diagnostics:', diagnostics);
    
    console.log('Filling form...');
    const results = await this.formFiller.fillForm();
    console.log('Fill results:', results);
    
    return { diagnostics, results };
  }
}

// Export everything for easy integration
export { OptionMatcher, OptionMapper, DropdownNavigator, EnhancedProfile };