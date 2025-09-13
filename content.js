// Content script for form detection and autofill
class SmartAutofill {
  constructor() {
    this.setupMessageListener();
    this.geminiAPI = null;
    this.initGeminiAPI();
  }

  initGeminiAPI() {
    // Initialize Gemini API for intelligent field matching
    this.geminiAPI = {
      apiKey: 'AIzaSyB3rWKBuqOTrV0uM1v3GSXpWhGy2CukEEA',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    };
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'autofillProfile') {
        this.handleAutofillRequest(request.profile)
          .then(result => sendResponse(result))
          .catch(error => {
            console.error('Autofill error:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Keep message channel open for async response
      }
    });
  }

  async handleAutofillRequest(profile) {
    try {
      console.log('Starting autofill with profile:', profile.name);
      
      // Find all form fields on the page
      const formFields = this.detectFormFields();
      console.log('Found form fields:', formFields.length);
      
      if (formFields.length === 0) {
        return { success: false, error: 'No form fields found on this page' };
      }

      // Match profile data to form fields
      const matches = await this.matchFieldsToProfile(formFields, profile.data);
      console.log('Field matches:', matches);

      // Fill the matched fields
      const filledCount = await this.fillFields(matches);
      
      // Update profile usage
      if (filledCount > 0) {
        chrome.runtime.sendMessage({
          action: 'updateProfileUsage',
          profileId: profile.id
        });
      }

      return {
        success: true,
        fieldsCount: filledCount,
        totalFields: formFields.length
      };

    } catch (error) {
      console.error('Autofill failed:', error);
      return { success: false, error: error.message };
    }
  }

  detectFormFields() {
    const fields = [];
    const selectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="url"]',
      'input[type="search"]',
      'input[type="number"]',
      'input[type="date"]',
      'input[type="datetime-local"]',
      'input[type="month"]',
      'input[type="week"]',
      'input[type="time"]',
      'input:not([type])', // Default input type is text
      'textarea',
      'select'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        // Skip hidden, disabled, or readonly fields
        if (element.type === 'hidden' || 
            element.disabled || 
            element.readOnly ||
            element.style.display === 'none' ||
            element.style.visibility === 'hidden') {
          return;
        }

        // Skip password fields for security
        if (element.type === 'password') {
          return;
        }

        const fieldInfo = this.extractFieldInfo(element);
        if (fieldInfo) {
          fields.push(fieldInfo);
        }
      });
    });

    return fields;
  }

  extractFieldInfo(element) {
    const fieldInfo = {
      element: element,
      id: element.id || '',
      name: element.name || '',
      type: element.type || 'text',
      placeholder: element.placeholder || '',
      label: this.getFieldLabel(element),
      ariaLabel: element.getAttribute('aria-label') || '',
      className: element.className || '',
      tagName: element.tagName.toLowerCase()
    };

    // Create a searchable text for this field
    fieldInfo.searchText = [
      fieldInfo.id,
      fieldInfo.name,
      fieldInfo.placeholder,
      fieldInfo.label,
      fieldInfo.ariaLabel
    ].join(' ').toLowerCase();

    return fieldInfo;
  }

  getFieldLabel(element) {
    // Try to find associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Look for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent.replace(element.value || '', '').trim();
    }

    // Look for nearby text
    const parent = element.parentElement;
    if (parent) {
      const textNodes = this.getTextNodes(parent);
      const nearbyText = textNodes
        .map(node => node.textContent.trim())
        .filter(text => text.length > 0 && text.length < 100)
        .join(' ');
      
      if (nearbyText) return nearbyText;
    }

    return '';
  }

  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.trim()) {
        textNodes.push(node);
      }
    }

    return textNodes;
  }

  async matchFieldsToProfile(formFields, profileData) {
    const matches = [];

    // Define field mapping patterns
    const fieldMappings = {
      // Personal Information
      firstName: ['first', 'fname', 'given', 'forename'],
      lastName: ['last', 'lname', 'surname', 'family'],
      email: ['email', 'mail', 'e-mail'],
      phone: ['phone', 'tel', 'mobile', 'cell'],
      dateOfBirth: ['birth', 'dob', 'birthday', 'born'],
      
      // Address Information
      street: ['street', 'address', 'addr', 'line1', 'address1'],
      city: ['city', 'town', 'locality'],
      state: ['state', 'province', 'region', 'county'],
      zipCode: ['zip', 'postal', 'postcode', 'pincode'],
      country: ['country', 'nation'],
      
      // Work Information
      company: ['company', 'employer', 'organization', 'org'],
      jobTitle: ['job', 'title', 'position', 'role', 'occupation'],
      
      // Education
      degree: ['degree', 'qualification', 'education'],
      institution: ['school', 'university', 'college', 'institution'],
      
      // Other
      skills: ['skill', 'expertise', 'ability'],
      interests: ['interest', 'hobby', 'passion'],
      languages: ['language', 'lang', 'speak']
    };

    // First pass: Direct matching
    for (const field of formFields) {
      let bestMatch = null;
      let bestScore = 0;

      for (const [profileKey, patterns] of Object.entries(fieldMappings)) {
        if (!profileData[profileKey]) continue;

        const score = this.calculateMatchScore(field, patterns);
        if (score > bestScore && score > 0.3) {
          bestScore = score;
          bestMatch = {
            field: field,
            profileKey: profileKey,
            value: profileData[profileKey],
            confidence: score,
            method: 'direct'
          };
        }
      }

      if (bestMatch) {
        matches.push(bestMatch);
      }
    }

    // Second pass: AI-powered matching for unmatched fields
    const unmatchedFields = formFields.filter(field => 
      !matches.some(match => match.field === field)
    );

    if (unmatchedFields.length > 0 && this.geminiAPI) {
      try {
        const aiMatches = await this.getAIMatches(unmatchedFields, profileData);
        matches.push(...aiMatches);
      } catch (error) {
        console.warn('AI matching failed, using fallback:', error);
      }
    }

    return matches;
  }

  calculateMatchScore(field, patterns) {
    let score = 0;
    const searchText = field.searchText;

    for (const pattern of patterns) {
      // Exact match in ID or name
      if (field.id.toLowerCase().includes(pattern) || 
          field.name.toLowerCase().includes(pattern)) {
        score += 1.0;
      }
      // Match in placeholder
      else if (field.placeholder.toLowerCase().includes(pattern)) {
        score += 0.8;
      }
      // Match in label
      else if (field.label.toLowerCase().includes(pattern)) {
        score += 0.7;
      }
      // Match in aria-label
      else if (field.ariaLabel.toLowerCase().includes(pattern)) {
        score += 0.6;
      }
      // Partial match in search text
      else if (searchText.includes(pattern)) {
        score += 0.4;
      }
    }

    return Math.min(score, 1.0);
  }

  async getAIMatches(unmatchedFields, profileData) {
    try {
      const prompt = `
        You are an AI assistant that matches web form fields to user profile data.
        
        Form fields to match:
        ${unmatchedFields.map((field, index) => `
        Field ${index}: {
          id: "${field.id}",
          name: "${field.name}",
          placeholder: "${field.placeholder}",
          label: "${field.label}",
          type: "${field.type}"
        }`).join('\n')}
        
        Available profile data:
        ${JSON.stringify(profileData, null, 2)}
        
        Return a JSON array of matches in this exact format:
        [
          {
            "fieldIndex": 0,
            "profileKey": "firstName",
            "confidence": 0.95,
            "reasoning": "Field labeled 'First Name' matches firstName profile data"
          }
        ]
        
        Only include matches with confidence > 0.5. Return empty array if no good matches.
      `;

      const response = await fetch(`${this.geminiAPI.baseURL}?key=${this.geminiAPI.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Parse AI response
      const aiMatches = JSON.parse(aiResponse.replace(/```json\n?|\n?```/g, ''));
      
      return aiMatches.map(match => ({
        field: unmatchedFields[match.fieldIndex],
        profileKey: match.profileKey,
        value: profileData[match.profileKey],
        confidence: match.confidence,
        method: 'ai',
        reasoning: match.reasoning
      }));

    } catch (error) {
      console.error('AI matching failed:', error);
      return [];
    }
  }

  async fillFields(matches) {
    let filledCount = 0;

    for (const match of matches) {
      try {
        const element = match.field.element;
        const value = String(match.value || '');

        if (!value) continue;

        // Set the value
        element.value = value;

        // Dispatch events to notify the website
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));

        // Add visual feedback
        this.addFillAnimation(element);

        filledCount++;
        
        console.log(`Filled field: ${match.field.name || match.field.id} with value: ${value}`);

      } catch (error) {
        console.error('Failed to fill field:', error);
      }
    }

    // Show success notification
    if (filledCount > 0) {
      this.showNotification(`Successfully filled ${filledCount} fields`, 'success');
    }

    return filledCount;
  }

  addFillAnimation(element) {
    element.style.transition = 'all 0.3s ease';
    element.style.backgroundColor = '#f3f4f6';
    element.style.borderColor = '#6b7280';
    
    setTimeout(() => {
      element.style.backgroundColor = '';
      element.style.borderColor = '';
    }, 1000);
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      background: ${type === 'success' ? '#4b5563' : '#6b7280'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize the autofill system
if (typeof window !== 'undefined') {
  window.smartAutofill = new SmartAutofill();
}