// Enhanced option matcher for MCQ and dropdown fields
export class OptionMatcher {
  constructor() {
    this.initializeMatchers();
  }

  initializeMatchers() {
    // Comprehensive mapping for common MCQ/dropdown categories
    this.categoryMappings = {
      // Personal Information
      gender: {
        patterns: ['gender', 'sex', 'male/female', 'mr/ms', 'mr./ms.'],
        options: {
          'male': ['male', 'man', 'boy', 'mr', 'mr.', 'gentleman', 'masculine'],
          'female': ['female', 'woman', 'girl', 'ms', 'ms.', 'mrs', 'mrs.', 'lady', 'feminine'],
          'other': ['other', 'non-binary', 'prefer not to say', 'rather not say', 'not specified'],
          'prefer not to answer': ['prefer not to answer', 'decline to state', 'no answer']
        }
      },

      maritalStatus: {
        patterns: ['marital', 'marriage', 'relationship status', 'civil status'],
        options: {
          'single': ['single', 'unmarried', 'bachelor', 'bachelorette', 'never married'],
          'married': ['married', 'wed', 'spouse', 'husband', 'wife'],
          'divorced': ['divorced', 'separated', 'former spouse'],
          'widowed': ['widowed', 'widow', 'widower'],
          'engaged': ['engaged', 'fiance', 'fiancee'],
          'domestic partnership': ['domestic partner', 'civil union', 'partnership'],
          'other': ['other', 'complicated', 'prefer not to say']
        }
      },

      // Geographic
      country: {
        patterns: ['country', 'nation', 'nationality', 'citizenship'],
        options: {
          // This will be handled by country code/name matching
        }
      },

      state: {
        patterns: ['state', 'province', 'region', 'prefecture'],
        options: {
          // This will be handled by state/province matching
        }
      },

      // Education
      educationLevel: {
        patterns: ['education', 'degree', 'qualification', 'schooling', 'academic'],
        options: {
          'high school': ['high school', 'secondary', 'diploma', 'ged', 'year 12', 'a levels'],
          'associate degree': ['associate', 'aa', 'as', '2-year degree', 'community college'],
          'bachelor degree': ['bachelor', 'ba', 'bs', 'undergraduate', '4-year degree'],
          'master degree': ['master', 'ma', 'ms', 'mba', 'graduate degree'],
          'doctoral degree': ['phd', 'doctorate', 'doctoral', 'doctor'],
          'professional degree': ['jd', 'md', 'dds', 'professional'],
          'some college': ['some college', 'partial', 'incomplete'],
          'no formal education': ['none', 'no education', 'self-taught']
        }
      },

      // Employment
      employmentStatus: {
        patterns: ['employment', 'work status', 'job status', 'occupation'],
        options: {
          'employed full-time': ['full time', 'full-time', 'employed', 'working'],
          'employed part-time': ['part time', 'part-time', 'casual'],
          'self-employed': ['self employed', 'freelance', 'contractor', 'business owner'],
          'unemployed': ['unemployed', 'job seeking', 'between jobs'],
          'retired': ['retired', 'pension'],
          'student': ['student', 'studying', 'in school'],
          'homemaker': ['homemaker', 'stay at home', 'domestic'],
          'unable to work': ['disabled', 'unable to work', 'medical leave']
        }
      },

      // Age ranges
      ageRange: {
        patterns: ['age', 'age group', 'age range', 'born'],
        options: {
          'under 18': ['under 18', '< 18', 'minor', 'teen'],
          '18-24': ['18-24', '18 to 24', '18-25'],
          '25-34': ['25-34', '25 to 34', '25-35'],
          '35-44': ['35-44', '35 to 44', '35-45'],
          '45-54': ['45-54', '45 to 54', '45-55'],
          '55-64': ['55-64', '55 to 64', '55-65'],
          '65+': ['65+', '65 and over', 'senior', 'elderly']
        }
      },

      // Income ranges
      income: {
        patterns: ['income', 'salary', 'earnings', 'revenue'],
        options: {
          'under $25,000': ['under 25', '< $25', 'less than 25k'],
          '$25,000-$49,999': ['25-49', '$25k-$49k', '25000-49999'],
          '$50,000-$74,999': ['50-74', '$50k-$74k', '50000-74999'],
          '$75,000-$99,999': ['75-99', '$75k-$99k', '75000-99999'],
          '$100,000+': ['100k+', 'over 100', '> $100k', '100000+']
        }
      },

      // Yes/No questions
      yesNo: {
        patterns: ['yes/no', 'true/false', 'agree/disagree'],
        options: {
          'yes': ['yes', 'y', 'true', 'agree', 'correct', 'accept', 'confirm'],
          'no': ['no', 'n', 'false', 'disagree', 'incorrect', 'decline', 'reject']
        }
      },

      // Interests/Hobbies
      interests: {
        patterns: ['interest', 'hobby', 'activity', 'passion', 'like', 'enjoy'],
        options: {
          'sports': ['sport', 'athletic', 'fitness', 'gym', 'running', 'basketball', 'football'],
          'technology': ['tech', 'computer', 'coding', 'programming', 'gadget'],
          'reading': ['read', 'book', 'literature', 'novel'],
          'music': ['music', 'song', 'instrument', 'concert', 'band'],
          'travel': ['travel', 'vacation', 'trip', 'explore', 'tourism'],
          'cooking': ['cook', 'food', 'recipe', 'chef', 'culinary'],
          'art': ['art', 'paint', 'draw', 'creative', 'design'],
          'gaming': ['game', 'video game', 'gaming', 'esports']
        }
      }
    };

    // Country mappings (abbreviated for brevity - in production, use comprehensive list)
    this.countryMappings = {
      'united states': ['usa', 'us', 'america', 'united states of america'],
      'united kingdom': ['uk', 'britain', 'england', 'great britain'],
      'canada': ['canada', 'ca'],
      'australia': ['australia', 'au', 'oz'],
      'germany': ['germany', 'de', 'deutschland'],
      'france': ['france', 'fr'],
      'india': ['india', 'in', 'bharat'],
      'china': ['china', 'cn', 'prc'],
      'japan': ['japan', 'jp', 'nippon'],
      'brazil': ['brazil', 'br', 'brasil']
    };
  }

  /**
   * Find the best matching option for a given question and user profile data
   * @param {Object} question - Question metadata including text, options, element
   * @param {Object} profileData - User profile data
   * @param {Object} context - Additional context (domain, form type, etc.)
   * @returns {Object} Matching result with option, confidence, and reasoning
   */
  async findBestMatch(question, profileData, context = {}) {
    const results = [];

    // Extract question information
    const questionText = this.extractQuestionText(question);
    const options = this.extractOptions(question);
    
    if (!options || options.length === 0) {
      return { option: null, confidence: 0, reasoning: 'No options found' };
    }

    console.log('Analyzing question:', questionText);
    console.log('Available options:', options);

    // Try different matching strategies
    
    // 1. Direct profile key matching
    const directMatch = await this.tryDirectMatch(questionText, options, profileData);
    if (directMatch.confidence > 0.7) {
      results.push({ ...directMatch, method: 'direct' });
    }

    // 2. Category-based matching
    const categoryMatch = await this.tryCategoryMatch(questionText, options, profileData);
    if (categoryMatch.confidence > 0.5) {
      results.push({ ...categoryMatch, method: 'category' });
    }

    // 3. Semantic similarity matching
    const semanticMatch = await this.trySemanticMatch(questionText, options, profileData);
    if (semanticMatch.confidence > 0.4) {
      results.push({ ...semanticMatch, method: 'semantic' });
    }

    // 4. AI-powered contextual matching (if available)
    if (context.useAI) {
      try {
        const aiMatch = await this.tryAIMatch(questionText, options, profileData, context);
        if (aiMatch.confidence > 0.3) {
          results.push({ ...aiMatch, method: 'ai' });
        }
      } catch (error) {
        console.warn('AI matching failed:', error);
      }
    }

    // Return the best result
    if (results.length === 0) {
      return { option: null, confidence: 0, reasoning: 'No suitable matches found' };
    }

    results.sort((a, b) => b.confidence - a.confidence);
    return results[0];
  }

  extractQuestionText(question) {
    if (typeof question === 'string') return question;
    
    return [
      question.label,
      question.text,
      question.ariaLabel,
      question.placeholder,
      question.title
    ].filter(Boolean).join(' ').toLowerCase();
  }

  extractOptions(question) {
    if (Array.isArray(question.options)) {
      return question.options;
    }

    // Extract from select element
    if (question.element && question.element.tagName.toLowerCase() === 'select') {
      return Array.from(question.element.options).map(opt => ({
        value: opt.value,
        text: opt.textContent.trim(),
        element: opt
      }));
    }

    // Extract from radio buttons or checkboxes
    if (question.optionElements) {
      return question.optionElements.map(el => ({
        value: el.value || el.textContent.trim(),
        text: el.textContent.trim() || el.getAttribute('aria-label') || '',
        element: el
      }));
    }

    return [];
  }

  async tryDirectMatch(questionText, options, profileData) {
    let bestMatch = null;
    let bestScore = 0;

    // Check if question directly references a profile key
    for (const [key, value] of Object.entries(profileData)) {
      if (!value) continue;

      const keyPatterns = [key.toLowerCase()];
      
      // Add common variations
      if (key === 'firstName') keyPatterns.push('first name', 'given name');
      if (key === 'lastName') keyPatterns.push('last name', 'family name', 'surname');
      if (key === 'phoneNumber') keyPatterns.push('phone', 'telephone', 'mobile');

      const matchesQuestion = keyPatterns.some(pattern => 
        questionText.includes(pattern)
      );

      if (matchesQuestion) {
        // Find option that matches the profile value
        for (const option of options) {
          const similarity = this.calculateStringSimilarity(
            String(value).toLowerCase(),
            option.text.toLowerCase()
          );

          if (similarity > bestScore && similarity > 0.6) {
            bestScore = similarity;
            bestMatch = {
              option: option,
              confidence: similarity,
              reasoning: `Direct match: ${key} value "${value}" matches option "${option.text}"`
            };
          }
        }
      }
    }

    return bestMatch || { option: null, confidence: 0, reasoning: 'No direct match found' };
  }

  async tryCategoryMatch(questionText, options, profileData) {
    let bestMatch = null;
    let bestScore = 0;

    // Check each category mapping
    for (const [category, mapping] of Object.entries(this.categoryMappings)) {
      // Does the question match this category?
      const questionMatchesCategory = mapping.patterns.some(pattern =>
        questionText.includes(pattern)
      );

      if (!questionMatchesCategory) continue;

      // Get user's value for this category
      const userValue = profileData[category];
      if (!userValue) continue;

      // Find matching option
      const userValueNorm = String(userValue).toLowerCase();
      
      for (const [categoryValue, synonyms] of Object.entries(mapping.options)) {
        // Check if user's value matches this category value
        const valueMatches = 
          userValueNorm === categoryValue.toLowerCase() ||
          synonyms.some(syn => userValueNorm.includes(syn.toLowerCase()));

        if (valueMatches) {
          // Find option that matches this category value
          for (const option of options) {
            const optionTextNorm = option.text.toLowerCase();
            
            const optionMatches = 
              optionTextNorm === categoryValue.toLowerCase() ||
              synonyms.some(syn => 
                optionTextNorm.includes(syn.toLowerCase()) ||
                this.calculateStringSimilarity(optionTextNorm, syn.toLowerCase()) > 0.7
              );

            if (optionMatches) {
              const confidence = 0.8; // High confidence for category matches
              if (confidence > bestScore) {
                bestScore = confidence;
                bestMatch = {
                  option: option,
                  confidence: confidence,
                  reasoning: `Category match: ${category} value "${userValue}" maps to option "${option.text}"`
                };
              }
            }
          }
        }
      }
    }

    return bestMatch || { option: null, confidence: 0, reasoning: 'No category match found' };
  }

  async trySemanticMatch(questionText, options, profileData) {
    let bestMatch = null;
    let bestScore = 0;

    // Create a searchable text from all profile values
    const profileText = Object.entries(profileData)
      .filter(([key, value]) => value && typeof value === 'string')
      .map(([key, value]) => `${key}: ${value}`)
      .join(' ')
      .toLowerCase();

    // For each option, calculate semantic similarity with profile
    for (const option of options) {
      const optionText = option.text.toLowerCase();
      
      // Calculate various similarity metrics
      const similarities = [];
      
      // Direct text similarity
      similarities.push(this.calculateStringSimilarity(profileText, optionText));
      
      // Word overlap
      const profileWords = new Set(profileText.split(/\s+/));
      const optionWords = new Set(optionText.split(/\s+/));
      const intersection = new Set([...profileWords].filter(x => optionWords.has(x)));
      const wordOverlap = intersection.size / Math.max(profileWords.size, optionWords.size);
      similarities.push(wordOverlap);

      // Keyword matching
      const keywordScore = this.calculateKeywordMatch(questionText, optionText, profileData);
      similarities.push(keywordScore);

      const maxSimilarity = Math.max(...similarities);
      
      if (maxSimilarity > bestScore && maxSimilarity > 0.4) {
        bestScore = maxSimilarity;
        bestMatch = {
          option: option,
          confidence: maxSimilarity,
          reasoning: `Semantic match: Option "${option.text}" has ${Math.round(maxSimilarity * 100)}% similarity with profile`
        };
      }
    }

    return bestMatch || { option: null, confidence: 0, reasoning: 'No semantic match found' };
  }

  calculateKeywordMatch(questionText, optionText, profileData) {
    const questionKeywords = this.extractKeywords(questionText);
    const optionKeywords = this.extractKeywords(optionText);
    
    let score = 0;
    let totalKeywords = 0;

    for (const [key, value] of Object.entries(profileData)) {
      if (!value || typeof value !== 'string') continue;
      
      const valueKeywords = this.extractKeywords(String(value));
      totalKeywords += valueKeywords.length;

      for (const keyword of valueKeywords) {
        if (optionKeywords.includes(keyword)) {
          score += 1;
        }
      }
    }

    return totalKeywords > 0 ? score / totalKeywords : 0;
  }

  extractKeywords(text) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  async tryAIMatch(questionText, options, profileData, context) {
    // This would integrate with the existing GeminiAPI
    // For now, return a placeholder implementation
    return {
      option: null,
      confidence: 0,
      reasoning: 'AI matching not implemented in this version'
    };
  }

  calculateStringSimilarity(str1, str2) {
    // Simple Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  calculateEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Validate and select the best option for a form element
   * @param {HTMLElement} element - The form element (select, radio group, etc.)
   * @param {Object} match - The matching result from findBestMatch
   * @returns {boolean} Success status
   */
  async selectOption(element, match) {
    if (!match.option || match.confidence < 0.3) {
      return false;
    }

    try {
      const tagName = element.tagName.toLowerCase();
      
      if (tagName === 'select') {
        return this.selectDropdownOption(element, match.option);
      } else if (element.type === 'radio') {
        return this.selectRadioOption(element, match.option);
      } else if (element.type === 'checkbox') {
        return this.selectCheckboxOption(element, match.option);
      }
      
      return false;
    } catch (error) {
      console.error('Failed to select option:', error);
      return false;
    }
  }

  selectDropdownOption(selectElement, option) {
    try {
      // Ensure the element is focused
      selectElement.focus();
      
      // Set the value
      selectElement.value = option.value;
      
      // Trigger events to notify the page
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
      selectElement.dispatchEvent(new Event('input', { bubbles: true }));
      
      return true;
    } catch (error) {
      console.error('Failed to select dropdown option:', error);
      return false;
    }
  }

  selectRadioOption(radioElement, option) {
    try {
      const radioGroup = document.querySelectorAll(`input[name="${radioElement.name}"]`);
      
      for (const radio of radioGroup) {
        if (radio.value === option.value || 
            radio.getAttribute('aria-label') === option.text ||
            radio.nextElementSibling?.textContent?.trim() === option.text) {
          
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles: true }));
          radio.dispatchEvent(new Event('click', { bubbles: true }));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to select radio option:', error);
      return false;
    }
  }

  selectCheckboxOption(checkboxElement, option) {
    try {
      if (option.text.toLowerCase().includes('yes') || 
          option.text.toLowerCase().includes('agree') ||
          option.text.toLowerCase().includes('accept')) {
        checkboxElement.checked = true;
      } else {
        checkboxElement.checked = false;
      }
      
      checkboxElement.dispatchEvent(new Event('change', { bubbles: true }));
      checkboxElement.dispatchEvent(new Event('click', { bubbles: true }));
      
      return true;
    } catch (error) {
      console.error('Failed to select checkbox option:', error);
      return false;
    }
  }
}