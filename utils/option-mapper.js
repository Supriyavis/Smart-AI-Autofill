// Smart option value mapping system
export class OptionMapper {
  constructor() {
    this.initializeMappings();
  }

  initializeMappings() {
    // Comprehensive country mappings with codes and variations
    this.countryMappings = {
      'afghanistan': { codes: ['AF', 'AFG'], variants: ['afghanistan'] },
      'albania': { codes: ['AL', 'ALB'], variants: ['albania', 'republic of albania'] },
      'algeria': { codes: ['DZ', 'DZA'], variants: ['algeria', 'democratic republic of algeria'] },
      'argentina': { codes: ['AR', 'ARG'], variants: ['argentina', 'argentine republic'] },
      'australia': { codes: ['AU', 'AUS'], variants: ['australia', 'commonwealth of australia', 'oz', 'aussie'] },
      'austria': { codes: ['AT', 'AUT'], variants: ['austria', 'republic of austria'] },
      'bangladesh': { codes: ['BD', 'BGD'], variants: ['bangladesh', 'people\'s republic of bangladesh'] },
      'belgium': { codes: ['BE', 'BEL'], variants: ['belgium', 'kingdom of belgium'] },
      'brazil': { codes: ['BR', 'BRA'], variants: ['brazil', 'brasil', 'federative republic of brazil'] },
      'canada': { codes: ['CA', 'CAN'], variants: ['canada'] },
      'china': { codes: ['CN', 'CHN'], variants: ['china', 'people\'s republic of china', 'prc'] },
      'denmark': { codes: ['DK', 'DNK'], variants: ['denmark', 'kingdom of denmark'] },
      'egypt': { codes: ['EG', 'EGY'], variants: ['egypt', 'arab republic of egypt'] },
      'finland': { codes: ['FI', 'FIN'], variants: ['finland', 'republic of finland'] },
      'france': { codes: ['FR', 'FRA'], variants: ['france', 'french republic'] },
      'germany': { codes: ['DE', 'DEU'], variants: ['germany', 'federal republic of germany', 'deutschland'] },
      'greece': { codes: ['GR', 'GRC'], variants: ['greece', 'hellenic republic'] },
      'india': { codes: ['IN', 'IND'], variants: ['india', 'republic of india', 'bharat'] },
      'indonesia': { codes: ['ID', 'IDN'], variants: ['indonesia', 'republic of indonesia'] },
      'ireland': { codes: ['IE', 'IRL'], variants: ['ireland', 'republic of ireland', 'eire'] },
      'italy': { codes: ['IT', 'ITA'], variants: ['italy', 'italian republic'] },
      'japan': { codes: ['JP', 'JPN'], variants: ['japan', 'nippon', 'nihon'] },
      'mexico': { codes: ['MX', 'MEX'], variants: ['mexico', 'united mexican states'] },
      'netherlands': { codes: ['NL', 'NLD'], variants: ['netherlands', 'holland', 'kingdom of the netherlands'] },
      'new zealand': { codes: ['NZ', 'NZL'], variants: ['new zealand', 'aotearoa'] },
      'norway': { codes: ['NO', 'NOR'], variants: ['norway', 'kingdom of norway'] },
      'poland': { codes: ['PL', 'POL'], variants: ['poland', 'republic of poland'] },
      'portugal': { codes: ['PT', 'PRT'], variants: ['portugal', 'portuguese republic'] },
      'russia': { codes: ['RU', 'RUS'], variants: ['russia', 'russian federation'] },
      'saudi arabia': { codes: ['SA', 'SAU'], variants: ['saudi arabia', 'kingdom of saudi arabia'] },
      'south africa': { codes: ['ZA', 'ZAF'], variants: ['south africa', 'republic of south africa'] },
      'south korea': { codes: ['KR', 'KOR'], variants: ['south korea', 'republic of korea', 'korea'] },
      'spain': { codes: ['ES', 'ESP'], variants: ['spain', 'kingdom of spain'] },
      'sweden': { codes: ['SE', 'SWE'], variants: ['sweden', 'kingdom of sweden'] },
      'switzerland': { codes: ['CH', 'CHE'], variants: ['switzerland', 'swiss confederation'] },
      'thailand': { codes: ['TH', 'THA'], variants: ['thailand', 'kingdom of thailand', 'siam'] },
      'turkey': { codes: ['TR', 'TUR'], variants: ['turkey', 'republic of turkey'] },
      'ukraine': { codes: ['UA', 'UKR'], variants: ['ukraine'] },
      'united arab emirates': { codes: ['AE', 'ARE'], variants: ['uae', 'united arab emirates'] },
      'united kingdom': { codes: ['GB', 'GBR', 'UK'], variants: ['uk', 'united kingdom', 'great britain', 'britain', 'england', 'scotland', 'wales'] },
      'united states': { codes: ['US', 'USA'], variants: ['usa', 'united states', 'america', 'united states of america', 'u.s.', 'u.s.a.'] },
      'vietnam': { codes: ['VN', 'VNM'], variants: ['vietnam', 'socialist republic of vietnam'] }
    };

    // US State mappings with codes and variations
    this.usStateMappings = {
      'alabama': { code: 'AL', variants: ['alabama', 'al'] },
      'alaska': { code: 'AK', variants: ['alaska', 'ak'] },
      'arizona': { code: 'AZ', variants: ['arizona', 'az'] },
      'arkansas': { code: 'AR', variants: ['arkansas', 'ar'] },
      'california': { code: 'CA', variants: ['california', 'ca', 'calif'] },
      'colorado': { code: 'CO', variants: ['colorado', 'co'] },
      'connecticut': { code: 'CT', variants: ['connecticut', 'ct', 'conn'] },
      'delaware': { code: 'DE', variants: ['delaware', 'de', 'del'] },
      'florida': { code: 'FL', variants: ['florida', 'fl', 'fla'] },
      'georgia': { code: 'GA', variants: ['georgia', 'ga'] },
      'hawaii': { code: 'HI', variants: ['hawaii', 'hi'] },
      'idaho': { code: 'ID', variants: ['idaho', 'id'] },
      'illinois': { code: 'IL', variants: ['illinois', 'il', 'ill'] },
      'indiana': { code: 'IN', variants: ['indiana', 'in', 'ind'] },
      'iowa': { code: 'IA', variants: ['iowa', 'ia'] },
      'kansas': { code: 'KS', variants: ['kansas', 'ks', 'kan'] },
      'kentucky': { code: 'KY', variants: ['kentucky', 'ky', 'ken'] },
      'louisiana': { code: 'LA', variants: ['louisiana', 'la'] },
      'maine': { code: 'ME', variants: ['maine', 'me'] },
      'maryland': { code: 'MD', variants: ['maryland', 'md'] },
      'massachusetts': { code: 'MA', variants: ['massachusetts', 'ma', 'mass'] },
      'michigan': { code: 'MI', variants: ['michigan', 'mi', 'mich'] },
      'minnesota': { code: 'MN', variants: ['minnesota', 'mn', 'minn'] },
      'mississippi': { code: 'MS', variants: ['mississippi', 'ms', 'miss'] },
      'missouri': { code: 'MO', variants: ['missouri', 'mo'] },
      'montana': { code: 'MT', variants: ['montana', 'mt', 'mont'] },
      'nebraska': { code: 'NE', variants: ['nebraska', 'ne', 'nebr'] },
      'nevada': { code: 'NV', variants: ['nevada', 'nv', 'nev'] },
      'new hampshire': { code: 'NH', variants: ['new hampshire', 'nh'] },
      'new jersey': { code: 'NJ', variants: ['new jersey', 'nj'] },
      'new mexico': { code: 'NM', variants: ['new mexico', 'nm'] },
      'new york': { code: 'NY', variants: ['new york', 'ny'] },
      'north carolina': { code: 'NC', variants: ['north carolina', 'nc'] },
      'north dakota': { code: 'ND', variants: ['north dakota', 'nd'] },
      'ohio': { code: 'OH', variants: ['ohio', 'oh'] },
      'oklahoma': { code: 'OK', variants: ['oklahoma', 'ok', 'okla'] },
      'oregon': { code: 'OR', variants: ['oregon', 'or', 'ore'] },
      'pennsylvania': { code: 'PA', variants: ['pennsylvania', 'pa', 'penn'] },
      'rhode island': { code: 'RI', variants: ['rhode island', 'ri'] },
      'south carolina': { code: 'SC', variants: ['south carolina', 'sc'] },
      'south dakota': { code: 'SD', variants: ['south dakota', 'sd'] },
      'tennessee': { code: 'TN', variants: ['tennessee', 'tn', 'tenn'] },
      'texas': { code: 'TX', variants: ['texas', 'tx', 'tex'] },
      'utah': { code: 'UT', variants: ['utah', 'ut'] },
      'vermont': { code: 'VT', variants: ['vermont', 'vt'] },
      'virginia': { code: 'VA', variants: ['virginia', 'va'] },
      'washington': { code: 'WA', variants: ['washington', 'wa', 'wash'] },
      'west virginia': { code: 'WV', variants: ['west virginia', 'wv'] },
      'wisconsin': { code: 'WI', variants: ['wisconsin', 'wi', 'wis'] },
      'wyoming': { code: 'WY', variants: ['wyoming', 'wy', 'wyo'] }
    };

    // Industry mappings for job-related dropdowns
    this.industryMappings = {
      'technology': {
        variants: ['technology', 'tech', 'it', 'information technology', 'software', 'computer', 'computing'],
        subcategories: ['software development', 'web development', 'data science', 'cybersecurity', 'ai/ml']
      },
      'healthcare': {
        variants: ['healthcare', 'health', 'medical', 'medicine', 'hospital', 'clinical'],
        subcategories: ['nursing', 'physician', 'pharmacy', 'dental', 'mental health']
      },
      'finance': {
        variants: ['finance', 'financial', 'banking', 'investment', 'accounting', 'fintech'],
        subcategories: ['investment banking', 'commercial banking', 'insurance', 'accounting', 'financial planning']
      },
      'education': {
        variants: ['education', 'teaching', 'academic', 'school', 'university', 'learning'],
        subcategories: ['k-12 education', 'higher education', 'corporate training', 'online education']
      },
      'retail': {
        variants: ['retail', 'sales', 'commerce', 'shopping', 'store', 'merchandise'],
        subcategories: ['e-commerce', 'fashion retail', 'food retail', 'automotive retail']
      },
      'manufacturing': {
        variants: ['manufacturing', 'production', 'industrial', 'factory', 'assembly'],
        subcategories: ['automotive', 'electronics', 'textiles', 'food processing']
      },
      'consulting': {
        variants: ['consulting', 'advisory', 'professional services', 'consulting services'],
        subcategories: ['management consulting', 'it consulting', 'financial consulting', 'hr consulting']
      },
      'media': {
        variants: ['media', 'entertainment', 'broadcasting', 'publishing', 'journalism'],
        subcategories: ['television', 'radio', 'digital media', 'print media', 'gaming']
      },
      'government': {
        variants: ['government', 'public sector', 'federal', 'state', 'local government', 'civil service'],
        subcategories: ['defense', 'law enforcement', 'public administration', 'regulatory']
      },
      'non-profit': {
        variants: ['non-profit', 'nonprofit', 'ngo', 'charity', 'social services', 'volunteer'],
        subcategories: ['social services', 'environmental', 'education', 'health advocacy']
      }
    };

    // Language mappings with native names and codes
    this.languageMappings = {
      'english': { codes: ['en', 'eng'], natives: ['english'], regions: ['us', 'uk', 'au', 'ca'] },
      'spanish': { codes: ['es', 'spa'], natives: ['español', 'spanish'], regions: ['es', 'mx', 'ar'] },
      'french': { codes: ['fr', 'fra'], natives: ['français', 'french'], regions: ['fr', 'ca', 'be'] },
      'german': { codes: ['de', 'deu'], natives: ['deutsch', 'german'], regions: ['de', 'at', 'ch'] },
      'italian': { codes: ['it', 'ita'], natives: ['italiano', 'italian'], regions: ['it'] },
      'portuguese': { codes: ['pt', 'por'], natives: ['português', 'portuguese'], regions: ['pt', 'br'] },
      'chinese': { codes: ['zh', 'chi'], natives: ['中文', 'chinese', 'mandarin'], regions: ['cn', 'tw'] },
      'japanese': { codes: ['ja', 'jpn'], natives: ['日本語', 'japanese'], regions: ['jp'] },
      'korean': { codes: ['ko', 'kor'], natives: ['한국어', 'korean'], regions: ['kr'] },
      'russian': { codes: ['ru', 'rus'], natives: ['русский', 'russian'], regions: ['ru'] },
      'arabic': { codes: ['ar', 'ara'], natives: ['العربية', 'arabic'], regions: ['sa', 'ae', 'eg'] },
      'hindi': { codes: ['hi', 'hin'], natives: ['हिन्दी', 'hindi'], regions: ['in'] },
      'dutch': { codes: ['nl', 'dut'], natives: ['nederlands', 'dutch'], regions: ['nl', 'be'] },
      'swedish': { codes: ['sv', 'swe'], natives: ['svenska', 'swedish'], regions: ['se'] },
      'norwegian': { codes: ['no', 'nor'], natives: ['norsk', 'norwegian'], regions: ['no'] },
      'danish': { codes: ['da', 'dan'], natives: ['dansk', 'danish'], regions: ['dk'] }
    };

    // Skill/expertise level mappings
    this.skillLevels = {
      'beginner': ['beginner', 'novice', 'entry level', 'basic', 'learning', 'new to'],
      'intermediate': ['intermediate', 'competent', 'proficient', 'experienced', 'skilled'],
      'advanced': ['advanced', 'expert', 'senior', 'professional', 'specialist', 'master'],
      'expert': ['expert', 'guru', 'authority', 'specialist', 'consultant', 'thought leader']
    };
  }

  /**
   * Map user profile data to the best matching option value
   * @param {string} userValue - The value from user profile
   * @param {Array} options - Available options from the form
   * @param {string} fieldType - Type of field (country, state, industry, etc.)
   * @param {Object} context - Additional context
   * @returns {Object} Best matching option with confidence score
   */
  mapToOption(userValue, options, fieldType = 'auto', context = {}) {
    if (!userValue || !options || options.length === 0) {
      return { option: null, confidence: 0, reasoning: 'Invalid input parameters' };
    }

    const userValueNorm = String(userValue).toLowerCase().trim();
    
    // Auto-detect field type if not specified
    if (fieldType === 'auto') {
      fieldType = this.detectFieldType(options, context);
    }

    console.log(`Mapping "${userValue}" to ${fieldType} options:`, options.map(o => o.text || o.value));

    // Use appropriate mapping strategy based on field type
    switch (fieldType) {
      case 'country':
        return this.mapCountry(userValueNorm, options);
      case 'state':
      case 'province':
        return this.mapState(userValueNorm, options, context.country);
      case 'industry':
        return this.mapIndustry(userValueNorm, options);
      case 'language':
        return this.mapLanguage(userValueNorm, options);
      case 'skill_level':
        return this.mapSkillLevel(userValueNorm, options);
      case 'date':
        return this.mapDate(userValueNorm, options);
      case 'numeric':
        return this.mapNumeric(userValueNorm, options);
      default:
        return this.mapGeneric(userValueNorm, options);
    }
  }

  detectFieldType(options, context = {}) {
    const optionTexts = options.map(o => (o.text || o.value || '').toLowerCase()).join(' ');
    
    // Check for countries (look for common country names)
    if (this.containsCountries(optionTexts)) {
      return 'country';
    }
    
    // Check for states (look for common state names/codes)
    if (this.containsStates(optionTexts)) {
      return 'state';
    }
    
    // Check for industries
    if (this.containsIndustries(optionTexts)) {
      return 'industry';
    }
    
    // Check for languages
    if (this.containsLanguages(optionTexts)) {
      return 'language';
    }
    
    // Check for skill levels
    if (this.containsSkillLevels(optionTexts)) {
      return 'skill_level';
    }
    
    // Check for dates (years, months, etc.)
    if (this.containsDates(optionTexts)) {
      return 'date';
    }
    
    // Check for numeric ranges
    if (this.containsNumericRanges(optionTexts)) {
      return 'numeric';
    }
    
    return 'generic';
  }

  containsCountries(text) {
    const commonCountries = ['united states', 'canada', 'united kingdom', 'australia', 'germany', 'france', 'india', 'china', 'japan'];
    return commonCountries.some(country => text.includes(country)) || text.includes('usa') || text.includes('uk');
  }

  containsStates(text) {
    const commonStates = ['california', 'texas', 'florida', 'new york', 'illinois'];
    return commonStates.some(state => text.includes(state)) || /\b[a-z]{2}\b/.test(text);
  }

  containsIndustries(text) {
    const commonIndustries = ['technology', 'healthcare', 'finance', 'education', 'manufacturing'];
    return commonIndustries.some(industry => text.includes(industry));
  }

  containsLanguages(text) {
    const commonLanguages = ['english', 'spanish', 'french', 'german', 'chinese', 'japanese'];
    return commonLanguages.some(lang => text.includes(lang));
  }

  containsSkillLevels(text) {
    const levels = ['beginner', 'intermediate', 'advanced', 'expert', 'novice', 'professional'];
    return levels.some(level => text.includes(level));
  }

  containsDates(text) {
    return /\b\d{4}\b/.test(text) || text.includes('january') || text.includes('2023') || text.includes('2024');
  }

  containsNumericRanges(text) {
    return /\d+-\d+/.test(text) || text.includes('$') || text.includes('under') || text.includes('over');
  }

  mapCountry(userValue, options) {
    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionText = (option.text || option.value || '').toLowerCase();
      const optionValue = (option.value || '').toLowerCase();
      
      // Check all country mappings
      for (const [countryName, mapping] of Object.entries(this.countryMappings)) {
        // Check if user value matches this country
        const userMatches = 
          userValue === countryName ||
          mapping.variants.some(variant => userValue.includes(variant)) ||
          mapping.codes.some(code => userValue === code.toLowerCase());

        if (userMatches) {
          // Check if option matches this country
          const optionMatches = 
            optionText.includes(countryName) ||
            mapping.variants.some(variant => optionText.includes(variant)) ||
            mapping.codes.some(code => 
              optionText.includes(code.toLowerCase()) || 
              optionValue === code.toLowerCase()
            );

          if (optionMatches) {
            const confidence = 0.9; // High confidence for exact country matches
            if (confidence > bestScore) {
              bestScore = confidence;
              bestMatch = {
                option: option,
                confidence: confidence,
                reasoning: `Country match: "${userValue}" maps to "${optionText}" (${countryName})`
              };
            }
          }
        }
      }
    }

    // Fallback to similarity matching
    if (!bestMatch) {
      for (const option of options) {
        const optionText = (option.text || option.value || '').toLowerCase();
        const similarity = this.calculateSimilarity(userValue, optionText);
        
        if (similarity > bestScore && similarity > 0.6) {
          bestScore = similarity;
          bestMatch = {
            option: option,
            confidence: similarity,
            reasoning: `Similarity match: "${userValue}" → "${optionText}" (${Math.round(similarity * 100)}%)`
          };
        }
      }
    }

    return bestMatch || { option: null, confidence: 0, reasoning: 'No country match found' };
  }

  mapState(userValue, options, country = 'us') {
    let bestMatch = null;
    let bestScore = 0;

    // For US states
    if (country === 'us' || !country) {
      for (const option of options) {
        const optionText = (option.text || option.value || '').toLowerCase();
        const optionValue = (option.value || '').toLowerCase();
        
        for (const [stateName, mapping] of Object.entries(this.usStateMappings)) {
          const userMatches = 
            userValue === stateName ||
            userValue === mapping.code.toLowerCase() ||
            mapping.variants.some(variant => userValue.includes(variant));

          if (userMatches) {
            const optionMatches = 
              optionText.includes(stateName) ||
              optionText.includes(mapping.code.toLowerCase()) ||
              optionValue === mapping.code.toLowerCase() ||
              mapping.variants.some(variant => optionText.includes(variant));

            if (optionMatches) {
              const confidence = 0.9;
              if (confidence > bestScore) {
                bestScore = confidence;
                bestMatch = {
                  option: option,
                  confidence: confidence,
                  reasoning: `State match: "${userValue}" maps to "${optionText}" (${stateName})`
                };
              }
            }
          }
        }
      }
    }

    // Fallback to similarity
    if (!bestMatch) {
      return this.mapGeneric(userValue, options);
    }

    return bestMatch;
  }

  mapIndustry(userValue, options) {
    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionText = (option.text || option.value || '').toLowerCase();
      
      for (const [industryName, mapping] of Object.entries(this.industryMappings)) {
        const userMatches = 
          userValue.includes(industryName) ||
          mapping.variants.some(variant => userValue.includes(variant)) ||
          mapping.subcategories?.some(sub => userValue.includes(sub));

        if (userMatches) {
          const optionMatches = 
            optionText.includes(industryName) ||
            mapping.variants.some(variant => optionText.includes(variant)) ||
            mapping.subcategories?.some(sub => optionText.includes(sub));

          if (optionMatches) {
            const confidence = 0.8;
            if (confidence > bestScore) {
              bestScore = confidence;
              bestMatch = {
                option: option,
                confidence: confidence,
                reasoning: `Industry match: "${userValue}" maps to "${optionText}" (${industryName})`
              };
            }
          }
        }
      }
    }

    return bestMatch || this.mapGeneric(userValue, options);
  }

  mapLanguage(userValue, options) {
    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionText = (option.text || option.value || '').toLowerCase();
      const optionValue = (option.value || '').toLowerCase();
      
      for (const [langName, mapping] of Object.entries(this.languageMappings)) {
        const userMatches = 
          userValue === langName ||
          mapping.natives.some(native => userValue.includes(native.toLowerCase())) ||
          mapping.codes.some(code => userValue === code.toLowerCase());

        if (userMatches) {
          const optionMatches = 
            optionText.includes(langName) ||
            mapping.natives.some(native => optionText.includes(native.toLowerCase())) ||
            mapping.codes.some(code => 
              optionText.includes(code.toLowerCase()) || 
              optionValue === code.toLowerCase()
            );

          if (optionMatches) {
            const confidence = 0.9;
            if (confidence > bestScore) {
              bestScore = confidence;
              bestMatch = {
                option: option,
                confidence: confidence,
                reasoning: `Language match: "${userValue}" maps to "${optionText}" (${langName})`
              };
            }
          }
        }
      }
    }

    return bestMatch || this.mapGeneric(userValue, options);
  }

  mapSkillLevel(userValue, options) {
    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionText = (option.text || option.value || '').toLowerCase();
      
      for (const [level, variants] of Object.entries(this.skillLevels)) {
        const userMatches = variants.some(variant => userValue.includes(variant));
        const optionMatches = variants.some(variant => optionText.includes(variant));

        if (userMatches && optionMatches) {
          const confidence = 0.85;
          if (confidence > bestScore) {
            bestScore = confidence;
            bestMatch = {
              option: option,
              confidence: confidence,
              reasoning: `Skill level match: "${userValue}" maps to "${optionText}" (${level})`
            };
          }
        }
      }
    }

    return bestMatch || this.mapGeneric(userValue, options);
  }

  mapDate(userValue, options) {
    // Extract year, month, or day from user value
    const yearMatch = userValue.match(/\b(19|20)\d{2}\b/);
    const monthMatch = userValue.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i);
    
    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionText = (option.text || option.value || '').toLowerCase();
      const optionValue = (option.value || '').toLowerCase();
      
      let matches = false;
      let confidence = 0;

      // Check year match
      if (yearMatch) {
        const year = yearMatch[0];
        if (optionText.includes(year) || optionValue.includes(year)) {
          matches = true;
          confidence = 0.9;
        }
      }

      // Check month match
      if (monthMatch && !matches) {
        const month = monthMatch[0];
        if (optionText.includes(month) || optionValue.includes(month)) {
          matches = true;
          confidence = 0.8;
        }
      }

      if (matches && confidence > bestScore) {
        bestScore = confidence;
        bestMatch = {
          option: option,
          confidence: confidence,
          reasoning: `Date match: "${userValue}" contains date element found in "${optionText}"`
        };
      }
    }

    return bestMatch || this.mapGeneric(userValue, options);
  }

  mapNumeric(userValue, options) {
    // Extract numbers from user value
    const userNumbers = userValue.match(/\d+/g);
    if (!userNumbers) {
      return this.mapGeneric(userValue, options);
    }

    const userNum = parseInt(userNumbers[0]);
    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionText = (option.text || option.value || '').toLowerCase();
      const optionNumbers = optionText.match(/\d+/g);
      
      if (optionNumbers) {
        // Check if user number falls within a range
        if (optionNumbers.length >= 2) {
          const min = parseInt(optionNumbers[0]);
          const max = parseInt(optionNumbers[1]);
          if (userNum >= min && userNum <= max) {
            const confidence = 0.9;
            if (confidence > bestScore) {
              bestScore = confidence;
              bestMatch = {
                option: option,
                confidence: confidence,
                reasoning: `Numeric range match: ${userNum} falls within range ${min}-${max}`
              };
            }
          }
        } else {
          // Direct number match
          const optionNum = parseInt(optionNumbers[0]);
          if (userNum === optionNum) {
            const confidence = 0.95;
            if (confidence > bestScore) {
              bestScore = confidence;
              bestMatch = {
                option: option,
                confidence: confidence,
                reasoning: `Direct numeric match: ${userNum} = ${optionNum}`
              };
            }
          }
        }
      }
    }

    return bestMatch || this.mapGeneric(userValue, options);
  }

  mapGeneric(userValue, options) {
    let bestMatch = null;
    let bestScore = 0;

    for (const option of options) {
      const optionText = (option.text || option.value || '').toLowerCase();
      
      // Try various similarity measures
      const similarities = [
        this.calculateSimilarity(userValue, optionText),
        this.calculateWordOverlap(userValue, optionText),
        this.calculateSubstringMatch(userValue, optionText)
      ];

      const maxSimilarity = Math.max(...similarities);
      
      if (maxSimilarity > bestScore && maxSimilarity > 0.4) {
        bestScore = maxSimilarity;
        bestMatch = {
          option: option,
          confidence: maxSimilarity,
          reasoning: `Generic similarity match: "${userValue}" → "${optionText}" (${Math.round(maxSimilarity * 100)}%)`
        };
      }
    }

    return bestMatch || { option: null, confidence: 0, reasoning: 'No suitable match found' };
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    if (longer.length === 0) return 1.0;
    
    return (longer.length - this.calculateEditDistance(longer, shorter)) / longer.length;
  }

  calculateWordOverlap(str1, str2) {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    return intersection.size / Math.max(words1.size, words2.size);
  }

  calculateSubstringMatch(str1, str2) {
    if (str1.includes(str2) || str2.includes(str1)) {
      return 0.8;
    }
    
    // Find longest common substring
    let maxLen = 0;
    for (let i = 0; i < str1.length; i++) {
      for (let j = 0; j < str2.length; j++) {
        let len = 0;
        while (i + len < str1.length && 
               j + len < str2.length && 
               str1[i + len] === str2[j + len]) {
          len++;
        }
        maxLen = Math.max(maxLen, len);
      }
    }
    
    return maxLen / Math.max(str1.length, str2.length);
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
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get suggestions for improving profile data to better match common form options
   * @param {Object} profileData - Current profile data
   * @returns {Array} Array of suggestions
   */
  getProfileSuggestions(profileData) {
    const suggestions = [];

    // Check country format
    if (profileData.country) {
      const countryFound = Object.entries(this.countryMappings).find(([name, mapping]) =>
        mapping.variants.some(variant => 
          profileData.country.toLowerCase().includes(variant)
        )
      );
      
      if (!countryFound) {
        suggestions.push({
          field: 'country',
          current: profileData.country,
          suggestion: 'Use full country name (e.g., "United States" instead of "US")',
          type: 'format'
        });
      }
    }

    // Check state format
    if (profileData.state) {
      const stateFound = Object.entries(this.usStateMappings).find(([name, mapping]) =>
        mapping.variants.some(variant => 
          profileData.state.toLowerCase().includes(variant)
        )
      );
      
      if (!stateFound) {
        suggestions.push({
          field: 'state',
          current: profileData.state,
          suggestion: 'Use full state name or standard abbreviation (e.g., "California" or "CA")',
          type: 'format'
        });
      }
    }

    // Check for missing common fields
    const commonFields = ['gender', 'maritalStatus', 'educationLevel', 'employmentStatus'];
    for (const field of commonFields) {
      if (!profileData[field]) {
        suggestions.push({
          field: field,
          current: null,
          suggestion: `Consider adding ${field} to improve form filling accuracy`,
          type: 'missing'
        });
      }
    }

    return suggestions;
  }
}