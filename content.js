// Content script for form detection and autofill
class SmartAutofill {
  constructor() {
    this.setupMessageListener();
  }

  // Read settings from storage
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        'confidenceThreshold', 'showPreview', 'requireConfirmation', 'enableAnimation'
      ], (settings) => {
        resolve({
          confidenceThreshold: settings.confidenceThreshold ?? 0.8,
          showPreview: settings.showPreview !== false, // default true
          requireConfirmation: settings.requireConfirmation || false,
          enableAnimation: settings.enableAnimation !== false,
        });
      });
    });
  }

  // Render AI preview overlay, return Promise<selectedMatches[]>
  showPreviewOverlay(matches, { threshold = 0.8 } = {}) {
    return new Promise((resolve) => {
      // Create overlay
      const overlay = document.createElement('div');
      overlay.className = 'smart-autofill-overlay active';

      const modal = document.createElement('div');
      modal.className = 'autofill-modal';
      overlay.appendChild(modal);

      // Header
      const header = document.createElement('div');
      header.className = 'modal-header';
      header.innerHTML = `
        <h3>Smart Autofill Preview</h3>
        <button class="close-btn" aria-label="Close">×</button>
      `;
      modal.appendChild(header);

      header.querySelector('.close-btn').onclick = () => {
        overlay.classList.add('closing');
        setTimeout(() => overlay.remove(), 200);
        resolve([]);
      };

      // Content
      const content = document.createElement('div');
      content.className = 'modal-content';
      modal.appendChild(content);

      const info = document.createElement('div');
      info.className = 'step active';
      info.innerHTML = `
        <div style="margin-bottom:12px;color:#6b7280;font-size:14px;">Review and confirm fields to fill. High-confidence items are preselected.</div>
      `;
      content.appendChild(info);

      const list = document.createElement('div');
      list.className = 'suggestions-list';
      content.appendChild(list);

      // Build rows
      matches.forEach((m, idx) => {
        const conf = Number(m.confidence ?? 0);
        const isHigh = conf >= threshold;
        const item = document.createElement('div');
        item.className = 'suggestion-item ' + (conf >= 0.85 ? 'high-confidence' : conf >= 0.65 ? 'medium-confidence' : 'low-confidence');
        item.innerHTML = `
          <div class="suggestion-header">
            <div class="field-label">${(m.field?.label || m.field?.placeholder || m.field?.name || m.field?.id || 'Field').toString().slice(0,80)}</div>
            <div class="confidence-badge">
              <span class="confidence-score">${Math.round(conf*100)}%</span>
              <div class="confidence-bar"><div class="confidence-fill" style="width:${Math.round(conf*100)}%"></div></div>
            </div>
          </div>
          <div class="suggestion-content">
            <input class="suggestion-value" type="text" value="${(String(m.value || '')).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}">
            <p class="suggestion-reasoning">${(m.reasoning || m.method || '').toString().slice(0,140)}</p>
          </div>
          <div class="suggestion-actions">
            <button class="btn-toggle ${isHigh ? 'active' : ''}" title="Include/Exclude">✔</button>
          </div>
        `;
        list.appendChild(item);

        // Toggle handling
        const toggle = item.querySelector('.btn-toggle');
        toggle.dataset.selected = isHigh ? '1' : '0';
        toggle.onclick = () => {
          const sel = toggle.dataset.selected === '1';
          toggle.dataset.selected = sel ? '0' : '1';
          toggle.classList.toggle('active');
        };

        // Allow editing value
        const input = item.querySelector('.suggestion-value');
        input.oninput = () => {
          m.value = input.value;
        };

        // Keep a reference for extraction later
        item.dataset.index = String(idx);
      });

      // Actions
      const actions = document.createElement('div');
      actions.className = 'modal-actions';
      actions.innerHTML = `
        <button class="btn btn-secondary" id="autofill-cancel">Cancel</button>
        <button class="btn btn-primary" id="autofill-confirm">Fill Selected</button>
      `;
      content.appendChild(actions);

      actions.querySelector('#autofill-cancel').onclick = () => {
        overlay.classList.add('closing');
        setTimeout(() => overlay.remove(), 200);
        resolve([]);
      };
      actions.querySelector('#autofill-confirm').onclick = () => {
        const selected = [];
        list.querySelectorAll('.suggestion-item').forEach((el) => {
          const idx = Number(el.dataset.index);
          const toggled = el.querySelector('.btn-toggle')?.dataset.selected === '1';
          if (toggled) selected.push(matches[idx]);
        });
        overlay.classList.add('closing');
        setTimeout(() => overlay.remove(), 200);
        resolve(selected);
      };

      document.body.appendChild(overlay);
    });
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
      // Expose profile data for option/MCQ helpers
      try { window.__lastAutofillProfileData = profile.data || {}; } catch (_) {}
      
      // Find all form fields on the page
      const formFields = this.detectFormFields();
      console.log('Found form fields:', formFields.length);
      
      if (formFields.length === 0) {
        return { success: false, error: 'No form fields found on this page' };
      }

      // Match profile data to form fields
      const matches = await this.matchFieldsToProfile(formFields, profile.data);
      console.log('Field matches:', matches);

      // Load user settings
      const settings = await this.getSettings();
      const threshold = Number(settings.confidenceThreshold ?? 0.8);

      // Partition by confidence
      const high = matches.filter(m => (m.confidence ?? 0) >= threshold);
      const low = matches.filter(m => (m.confidence ?? 0) < threshold);

      let filledCount = 0;
      if (settings.showPreview || settings.requireConfirmation) {
        // Show overlay preview and let user choose
        const selected = await this.showPreviewOverlay([...high, ...low], { threshold });
        if (selected && selected.length) {
          filledCount += await this.fillFields(selected);
        }
      } else {
        // Auto-fill high confidence only
        filledCount += await this.fillFields(high);
      }
      
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
      'select',
      '[contenteditable="true"]'
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
      autocomplete: (element.getAttribute('autocomplete') || '').toLowerCase(),
      className: element.className || '',
      tagName: element.tagName.toLowerCase()
    };

    // Create a searchable text for this field
    fieldInfo.searchText = [
      fieldInfo.id,
      fieldInfo.name,
      fieldInfo.placeholder,
      fieldInfo.label,
      fieldInfo.ariaLabel,
      fieldInfo.autocomplete
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

    // aria-labelledby reference
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(/\s+/);
      const texts = ids.map(id => document.getElementById(id)?.textContent?.trim()).filter(Boolean);
      if (texts.length) return texts.join(' ');
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

    // Google Forms heuristic: climb to question container and read heading
    // Common containers have role="listitem" or role="group" with a child having role="heading"
    const container = element.closest('[role="listitem"], [role="group"], .freebirdFormviewerComponentsQuestionBaseRoot') || element.closest('div');
    if (container) {
      const heading = container.querySelector('[role="heading"], .freebirdFormviewerComponentsQuestionBaseTitle');
      const headingText = heading?.textContent?.trim();
      if (headingText) return headingText;
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

    if (unmatchedFields.length > 0) {
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
      // Match in autocomplete attribute (e.g., given-name, family-name, email)
      else if (field.autocomplete && field.autocomplete.includes(pattern)) {
        score += 0.9;
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
      // Prepare lightweight field descriptors (no DOM elements)
      const fields = unmatchedFields.map((f) => ({
        id: f.id,
        name: f.name,
        placeholder: f.placeholder,
        label: f.label,
        type: f.type,
        tagName: f.tagName,
        ariaLabel: f.ariaLabel,
        autocomplete: f.autocomplete,
      }));

      const domain = location.host;
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          action: 'aiMatchFields',
          fields,
          profileData,
          domain,
        }, resolve);
      });

      if (!response || !response.success || !response.data) {
        throw new Error(response?.error || 'AI match failed');
      }

      const suggestions = response.data.suggestions || [];
      return suggestions
        .filter(s => typeof s.fieldIndex === 'number' && s.confidence > 0.5)
        .map(s => ({
          field: unmatchedFields[s.fieldIndex],
          profileKey: s.profileKey,
          value: profileData[s.profileKey],
          confidence: s.confidence,
          method: 'ai',
          reasoning: s.reasoning,
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

        // Ensure element is focused so frameworks register updates
        try { element.focus({ preventScroll: true }); } catch (_) {}

        // Set the value depending on element type
        if (element.matches('[contenteditable="true"]')) {
          // For contenteditable (e.g., Google Forms long answers)
          try {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, value);
          } catch (_) {
            element.textContent = value;
          }
        } else if (element.tagName.toLowerCase() === 'select') {
          // Basic select handling by exact text/value match
          let set = false;
          for (const opt of element.options) {
            if (opt.value.toLowerCase() === value.toLowerCase() || opt.text.toLowerCase() === value.toLowerCase()) {
              element.value = opt.value;
              set = true;
              break;
            }
          }
          if (!set) {
            element.value = value; // best-effort
          }
        } else {
          element.value = value;
        }

        // Dispatch events to notify the website (simulate typing)
        try { element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' })); } catch (_) {}
        element.dispatchEvent(new Event('input', { bubbles: true }));
        try { element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' })); } catch (_) {}
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('blur', { bubbles: true }));

        // Add visual feedback
        this.addFillAnimation(element);

        filledCount++;
        
        console.log(`Filled field: ${match.field.name || '""'} ${match.field.id ? `(#${match.field.id})` : ''} with value: ${value}`);

      } catch (error) {
        console.error('Failed to fill field:', error);
      }
    }

    // Show success notification
    if (filledCount > 0) {
      this.showNotification(`Successfully filled ${filledCount} fields`, 'success');
    }

    // Additionally try to fill MCQ/Option style questions (e.g., Google Forms)
    try {
      const mcqCount = await this.fillOptionQuestions(matches.map(m => m.profileKey).filter(Boolean), matches[0]?.value ? {} : {});
      filledCount += mcqCount;
    } catch (e) {
      console.warn('MCQ fill attempt failed:', e);
    }

    return filledCount;
  }

  // Try to fill radio/checkbox options based on profile data.
  // We infer keys from question labels and map them using fieldMappings keys already used above.
  async fillOptionQuestions(usedKeys = [], profileOverrides = {}) {
    // Build a combined profile data map from the page-level profile passed earlier if accessible
    // Fallback: try to fetch last used profile via background if needed (skipped for simplicity)
    let count = 0;

    const fieldMappings = {
      firstName: ['first', 'fname', 'given', 'forename'],
      lastName: ['last', 'lname', 'surname', 'family'],
      email: ['email', 'mail', 'e-mail'],
      phone: ['phone', 'tel', 'mobile', 'cell'],
      dateOfBirth: ['birth', 'dob', 'birthday', 'born'],
      gender: ['gender', 'sex'],
      country: ['country', 'nation'],
      state: ['state', 'province', 'region'],
      city: ['city', 'town', 'locality'],
      degree: ['degree', 'qualification', 'education'],
      languages: ['language', 'lang', 'speak'],
      skills: ['skill', 'expertise', 'ability']
    };

    // Collect all option-like elements
    const optionSelectors = '[role="radio"], [role="checkbox"]';
    const optionElements = Array.from(document.querySelectorAll(optionSelectors));
    if (optionElements.length === 0) return 0;

    // Group options by their question container
    const groups = new Map();
    for (const el of optionElements) {
      const container = el.closest('[role="listitem"], [role="group"], .freebirdFormviewerComponentsQuestionBaseRoot') || el.parentElement;
      if (!container) continue;
      if (!groups.has(container)) groups.set(container, []);
      groups.get(container).push(el);
    }

    // Determine question label and try to find matching profile key
    for (const [container, options] of groups.entries()) {
      const questionLabel = this.getFieldLabel(container) || container.querySelector('[role="heading"], .freebirdFormviewerComponentsQuestionBaseTitle')?.textContent?.trim() || '';
      const qText = (questionLabel || '').toLowerCase();

      let matchedKey = null;
      for (const [key, patterns] of Object.entries(fieldMappings)) {
        if (patterns.some(p => qText.includes(p))) {
          matchedKey = key;
          break;
        }
      }
      if (!matchedKey) continue;

      // Try to get the desired value from the profile stored earlier on window if any
      const profile = window.__lastAutofillProfileData || {};
      const desired = (profileOverrides[matchedKey] ?? profile[matchedKey]) || '';
      if (!desired) continue;

      const desiredVals = Array.isArray(desired) ? desired.map(String) : [String(desired)];

      // Find an option whose text matches desired value
      for (const desiredVal of desiredVals) {
        const dNorm = this._norm(desiredVal);
        let clicked = false;
        for (const opt of options) {
          const text = opt.getAttribute('aria-label') || opt.textContent || '';
          const tNorm = this._norm(text);
          if (!tNorm) continue;
          if (tNorm === dNorm || tNorm.includes(dNorm) || dNorm.includes(tNorm)) {
            try {
              opt.scrollIntoView({ block: 'center', inline: 'center' });
              opt.click();
              count++;
              clicked = true;
              break;
            } catch (_) {}
          }
        }
        if (clicked) break;
      }
    }

    return count;
  }

  _norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[\.:,;"'`]/g, '')
      .trim();
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