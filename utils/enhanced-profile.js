// Enhanced profile data structure with better MCQ/dropdown support
export class EnhancedProfile {
  constructor(profileData = {}) {
    this.profile = this.normalizeProfile(profileData);
    this.metadata = {
      version: '2.0',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      compatibilityLevel: 'advanced'
    };
  }

  /**
   * Normalize and enhance profile data structure
   * @param {Object} data - Raw profile data
   * @returns {Object} Enhanced profile data
   */
  normalizeProfile(data) {
    const enhanced = {
      // Core Identity
      identity: {
        firstName: data.firstName || data.first_name || '',
        lastName: data.lastName || data.last_name || '',
        middleName: data.middleName || data.middle_name || '',
        fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        preferredName: data.preferredName || data.nickname || data.firstName || '',
        
        // Title and honorifics
        title: data.title || this.inferTitle(data),
        suffix: data.suffix || '',
        
        // Gender and pronouns
        gender: data.gender || this.inferGender(data),
        pronouns: data.pronouns || this.inferPronouns(data),
        
        // Date of birth variations
        dateOfBirth: data.dateOfBirth || data.dob || data.birthDate || '',
        birthYear: data.birthYear || this.extractBirthYear(data),
        birthMonth: data.birthMonth || this.extractBirthMonth(data),
        birthDay: data.birthDay || this.extractBirthDay(data),
        age: data.age || this.calculateAge(data),
        ageRange: data.ageRange || this.calculateAgeRange(data)
      },

      // Contact Information
      contact: {
        email: data.email || data.emailAddress || '',
        emailAlternate: data.emailAlternate || data.alternateEmail || '',
        
        // Phone number variations
        phone: data.phone || data.phoneNumber || data.mobile || '',
        phoneHome: data.phoneHome || data.homePhone || '',
        phoneWork: data.phoneWork || data.workPhone || '',
        phoneMobile: data.phoneMobile || data.mobile || data.cell || '',
        
        // Formatted phone numbers for different contexts
        phoneFormatted: this.formatPhone(data.phone || data.phoneNumber || data.mobile),
        phoneInternational: this.formatPhoneInternational(data.phone || data.phoneNumber),
        
        // Social media
        linkedin: data.linkedin || data.linkedinUrl || '',
        twitter: data.twitter || data.twitterHandle || '',
        github: data.github || data.githubUsername || '',
        website: data.website || data.personalWebsite || ''
      },

      // Address Information (Enhanced for better matching)
      address: {
        // Current address
        street: data.street || data.address || data.streetAddress || '',
        streetNumber: data.streetNumber || this.extractStreetNumber(data.street),
        streetName: data.streetName || this.extractStreetName(data.street),
        apartment: data.apartment || data.apt || data.unit || '',
        city: data.city || '',
        state: data.state || data.province || data.region || '',
        stateCode: data.stateCode || this.getStateCode(data.state),
        stateName: data.stateName || this.getStateName(data.state),
        zipCode: data.zipCode || data.zip || data.postalCode || '',
        country: data.country || '',
        countryCode: data.countryCode || this.getCountryCode(data.country),
        countryName: data.countryName || this.getCountryName(data.country),
        
        // Full formatted addresses
        fullAddress: this.formatFullAddress(data),
        fullAddressInternational: this.formatInternationalAddress(data),
        
        // Alternative addresses
        mailingAddress: data.mailingAddress || {},
        billingAddress: data.billingAddress || {},
        workAddress: data.workAddress || {}
      },

      // Education (Enhanced with multiple formats)
      education: {
        level: data.educationLevel || data.education || '',
        levelNormalized: this.normalizeEducationLevel(data.educationLevel || data.education),
        levelCategory: this.categorizeEducationLevel(data.educationLevel || data.education),
        
        // Multiple institution support
        institutions: this.normalizeInstitutions(data.institutions || data.schools || []),
        currentInstitution: data.currentInstitution || data.school || data.university || '',
        
        // Degrees and certifications
        degrees: this.normalizeDegrees(data.degrees || []),
        certifications: this.normalizeCertifications(data.certifications || []),
        
        // Academic details
        graduationYear: data.graduationYear || this.extractGraduationYear(data),
        gpa: data.gpa || '',
        honors: data.honors || data.academicHonors || [],
        fieldOfStudy: data.fieldOfStudy || data.major || data.subject || ''
      },

      // Employment (Enhanced with industry matching)
      employment: {
        status: data.employmentStatus || data.workStatus || '',
        statusNormalized: this.normalizeEmploymentStatus(data.employmentStatus),
        statusCategory: this.categorizeEmploymentStatus(data.employmentStatus),
        
        // Current job
        company: data.company || data.employer || data.organization || '',
        jobTitle: data.jobTitle || data.position || data.role || data.title || '',
        jobTitleNormalized: this.normalizeJobTitle(data.jobTitle || data.position),
        jobLevel: this.inferJobLevel(data.jobTitle, data.yearsOfExperience),
        
        // Industry information
        industry: data.industry || data.sector || '',
        industryNormalized: this.normalizeIndustry(data.industry),
        industryCategory: this.categorizeIndustry(data.industry),
        
        // Experience
        yearsOfExperience: data.yearsOfExperience || data.experience || 0,
        experienceLevel: this.calculateExperienceLevel(data.yearsOfExperience),
        
        // Employment history
        previousJobs: this.normalizeJobHistory(data.previousJobs || data.workHistory || []),
        
        // Income information
        income: data.income || data.salary || '',
        incomeRange: data.incomeRange || this.calculateIncomeRange(data.income),
        currency: data.currency || this.inferCurrency(data.country)
      },

      // Skills and Languages (Enhanced)
      skills: {
        // Technical skills
        technical: this.normalizeSkills(data.technicalSkills || data.skills || []),
        programming: this.extractProgrammingSkills(data),
        software: this.extractSoftwareSkills(data),
        
        // Soft skills
        soft: this.normalizeSoftSkills(data.softSkills || []),
        
        // Languages
        languages: this.normalizeLanguages(data.languages || []),
        primaryLanguage: data.primaryLanguage || data.nativeLanguage || 'English',
        languageProficiency: this.normalizeLanguageProficiency(data.languageProficiency || {}),
        
        // Skill levels
        skillLevels: this.normalizeSkillLevels(data.skillLevels || {}),
        overallExpertise: this.calculateOverallExpertise(data)
      },

      // Personal Information
      personal: {
        // Marital status
        maritalStatus: data.maritalStatus || '',
        maritalStatusNormalized: this.normalizeMaritalStatus(data.maritalStatus),
        
        // Family information
        hasChildren: data.hasChildren || this.inferHasChildren(data),
        numberOfChildren: data.numberOfChildren || 0,
        
        // Personal interests
        interests: this.normalizeInterests(data.interests || data.hobbies || []),
        interestCategories: this.categorizeInterests(data.interests || data.hobbies || []),
        
        // Lifestyle
        lifestyle: data.lifestyle || {},
        personalityType: data.personalityType || data.mbti || '',
        
        // Demographics
        ethnicity: data.ethnicity || data.race || '',
        religion: data.religion || '',
        politicalAffiliation: data.politicalAffiliation || ''
      },

      // Preferences and Settings (MCQ-friendly)
      preferences: {
        // Communication preferences
        communication: {
          preferredContact: data.preferredContact || 'email',
          communicationFrequency: data.communicationFrequency || 'weekly',
          language: data.preferredLanguage || data.language || 'English',
          timezone: data.timezone || this.inferTimezone(data.country)
        },
        
        // Product/service preferences
        shopping: {
          preferredBrands: data.preferredBrands || [],
          shippingSpeed: data.shippingSpeed || 'standard',
          paymentMethod: data.paymentMethod || 'credit_card',
          priceRange: data.priceRange || this.calculatePreferredPriceRange(data)
        },
        
        // Content preferences
        content: {
          interests: data.contentInterests || [],
          difficulty: data.contentDifficulty || 'intermediate',
          format: data.contentFormat || 'mixed',
          frequency: data.contentFrequency || 'weekly'
        },
        
        // Privacy preferences
        privacy: {
          shareData: data.shareData !== false,
          marketing: data.marketing !== false,
          newsletter: data.newsletter !== false,
          notifications: data.notifications !== false
        }
      },

      // Goals and Objectives (For contextual matching)
      goals: {
        career: data.careerGoals || [],
        personal: data.personalGoals || [],
        learning: data.learningGoals || [],
        financial: data.financialGoals || [],
        
        // Current objectives
        currentObjective: data.currentObjective || '',
        objectiveCategory: this.categorizeObjective(data.currentObjective),
        
        // Timeline
        shortTermGoals: data.shortTermGoals || [],
        longTermGoals: data.longTermGoals || []
      },

      // Behavioral Data (For intelligent matching)
      behavior: {
        // Purchase behavior
        purchaseHistory: data.purchaseHistory || [],
        averageOrderValue: data.averageOrderValue || 0,
        purchaseFrequency: data.purchaseFrequency || 'monthly',
        
        // Engagement patterns
        engagementLevel: data.engagementLevel || 'medium',
        activityLevel: data.activityLevel || 'moderate',
        responseRate: data.responseRate || 0.5,
        
        // Preferences learned from behavior
        inferredPreferences: this.inferPreferences(data),
        personalityTraits: this.inferPersonalityTraits(data)
      }
    };

    // Add computed fields for better matching
    enhanced.computed = {
      searchableText: this.createSearchableText(enhanced),
      matchingKeywords: this.extractMatchingKeywords(enhanced),
      categoryTags: this.generateCategoryTags(enhanced),
      confidenceScores: this.calculateFieldConfidences(enhanced, data)
    };

    return enhanced;
  }

  // Helper methods for data normalization and inference

  inferTitle(data) {
    if (data.gender === 'Male' || data.gender === 'M') return 'Mr.';
    if (data.gender === 'Female' || data.gender === 'F') return 'Ms.';
    return '';
  }

  inferGender(data) {
    if (data.title === 'Mr.' || data.title === 'Mr') return 'Male';
    if (data.title === 'Ms.' || data.title === 'Mrs.' || data.title === 'Miss') return 'Female';
    if (data.title === 'Dr.') return ''; // Cannot infer from Dr.
    
    // Try to infer from first name (basic approach)
    const maleNames = ['john', 'michael', 'david', 'robert', 'james', 'william', 'richard'];
    const femaleNames = ['mary', 'jennifer', 'linda', 'elizabeth', 'barbara', 'susan', 'jessica'];
    
    const firstName = (data.firstName || '').toLowerCase();
    if (maleNames.includes(firstName)) return 'Male';
    if (femaleNames.includes(firstName)) return 'Female';
    
    return '';
  }

  inferPronouns(data) {
    const gender = data.gender || this.inferGender(data);
    if (gender === 'Male' || gender === 'M') return 'he/him';
    if (gender === 'Female' || gender === 'F') return 'she/her';
    return 'they/them';
  }

  extractBirthYear(data) {
    if (data.birthYear) return data.birthYear;
    if (data.dateOfBirth || data.dob) {
      const date = new Date(data.dateOfBirth || data.dob);
      if (!isNaN(date.getTime())) return date.getFullYear();
    }
    if (data.age) {
      return new Date().getFullYear() - data.age;
    }
    return null;
  }

  extractBirthMonth(data) {
    if (data.dateOfBirth || data.dob) {
      const date = new Date(data.dateOfBirth || data.dob);
      if (!isNaN(date.getTime())) return date.getMonth() + 1;
    }
    return null;
  }

  extractBirthDay(data) {
    if (data.dateOfBirth || data.dob) {
      const date = new Date(data.dateOfBirth || data.dob);
      if (!isNaN(date.getTime())) return date.getDate();
    }
    return null;
  }

  calculateAge(data) {
    if (data.age) return data.age;
    
    const birthYear = this.extractBirthYear(data);
    if (birthYear) {
      return new Date().getFullYear() - birthYear;
    }
    
    return null;
  }

  calculateAgeRange(data) {
    const age = this.calculateAge(data);
    if (!age) return '';
    
    if (age < 18) return 'Under 18';
    if (age <= 24) return '18-24';
    if (age <= 34) return '25-34';
    if (age <= 44) return '35-44';
    if (age <= 54) return '45-54';
    if (age <= 64) return '55-64';
    return '65+';
  }

  normalizeEducationLevel(level) {
    if (!level) return '';
    
    const levelLower = level.toLowerCase();
    
    // Map various education formats to standardized terms
    const educationMappings = {
      'high school': ['high school', 'secondary', 'diploma', 'ged', 'year 12', 'a levels'],
      'associate degree': ['associate', 'aa', 'as', '2-year', 'community college'],
      'bachelor degree': ['bachelor', 'ba', 'bs', 'undergraduate', '4-year', 'bachelors'],
      'master degree': ['master', 'ma', 'ms', 'mba', 'graduate', 'masters'],
      'doctoral degree': ['phd', 'doctorate', 'doctoral', 'doctor', 'ph.d.', 'md', 'jd'],
      'professional degree': ['professional', 'law', 'medical', 'dds', 'pharmd'],
      'some college': ['some college', 'partial', 'incomplete', 'attended'],
      'certificate': ['certificate', 'certification', 'diploma program'],
      'vocational': ['vocational', 'trade', 'technical', 'skills training']
    };
    
    for (const [standard, variations] of Object.entries(educationMappings)) {
      if (variations.some(variation => levelLower.includes(variation))) {
        return standard;
      }
    }
    
    return level; // Return original if no mapping found
  }

  categorizeEducationLevel(level) {
    const normalized = this.normalizeEducationLevel(level);
    
    const categories = {
      'no_formal': ['no formal education', 'self-taught'],
      'high_school': ['high school'],
      'some_college': ['some college', 'certificate', 'vocational'],
      'undergraduate': ['associate degree', 'bachelor degree'],
      'graduate': ['master degree', 'doctoral degree', 'professional degree']
    };
    
    for (const [category, levels] of Object.entries(categories)) {
      if (levels.includes(normalized)) return category;
    }
    
    return 'other';
  }

  normalizeEmploymentStatus(status) {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    
    const statusMappings = {
      'employed full-time': ['full time', 'full-time', 'employed', 'working', 'ft'],
      'employed part-time': ['part time', 'part-time', 'casual', 'pt'],
      'self-employed': ['self employed', 'freelance', 'contractor', 'business owner', 'entrepreneur'],
      'unemployed': ['unemployed', 'job seeking', 'between jobs', 'looking for work'],
      'retired': ['retired', 'pension', 'retirement'],
      'student': ['student', 'studying', 'in school', 'full-time student'],
      'homemaker': ['homemaker', 'stay at home', 'domestic', 'housewife', 'househusband'],
      'unable to work': ['disabled', 'unable to work', 'medical leave', 'disability']
    };
    
    for (const [standard, variations] of Object.entries(statusMappings)) {
      if (variations.some(variation => statusLower.includes(variation))) {
        return standard;
      }
    }
    
    return status;
  }

  categorizeEmploymentStatus(status) {
    const normalized = this.normalizeEmploymentStatus(status);
    
    const categories = {
      'working': ['employed full-time', 'employed part-time', 'self-employed'],
      'not_working': ['unemployed', 'retired', 'unable to work'],
      'other': ['student', 'homemaker']
    };
    
    for (const [category, statuses] of Object.entries(categories)) {
      if (statuses.includes(normalized)) return category;
    }
    
    return 'other';
  }

  normalizeIndustry(industry) {
    if (!industry) return '';
    
    const industryLower = industry.toLowerCase();
    
    const industryMappings = {
      'technology': ['technology', 'tech', 'it', 'information technology', 'software', 'computer'],
      'healthcare': ['healthcare', 'health', 'medical', 'medicine', 'hospital', 'clinical'],
      'finance': ['finance', 'financial', 'banking', 'investment', 'accounting', 'insurance'],
      'education': ['education', 'teaching', 'academic', 'school', 'university'],
      'retail': ['retail', 'sales', 'commerce', 'shopping', 'store'],
      'manufacturing': ['manufacturing', 'production', 'industrial', 'factory'],
      'consulting': ['consulting', 'advisory', 'professional services'],
      'media': ['media', 'entertainment', 'broadcasting', 'publishing'],
      'government': ['government', 'public sector', 'federal', 'state'],
      'non-profit': ['non-profit', 'nonprofit', 'ngo', 'charity']
    };
    
    for (const [standard, variations] of Object.entries(industryMappings)) {
      if (variations.some(variation => industryLower.includes(variation))) {
        return standard;
      }
    }
    
    return industry;
  }

  normalizeMaritalStatus(status) {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    
    const statusMappings = {
      'single': ['single', 'unmarried', 'never married'],
      'married': ['married', 'wed', 'spouse'],
      'divorced': ['divorced', 'separated'],
      'widowed': ['widowed', 'widow', 'widower'],
      'engaged': ['engaged', 'fiance', 'fiancee'],
      'domestic partnership': ['domestic partner', 'civil union', 'partnership']
    };
    
    for (const [standard, variations] of Object.entries(statusMappings)) {
      if (variations.some(variation => statusLower.includes(variation))) {
        return standard;
      }
    }
    
    return status;
  }

  normalizeLanguages(languages) {
    if (!Array.isArray(languages)) {
      if (typeof languages === 'string') {
        // Split string of languages
        languages = languages.split(/[,;]/).map(lang => lang.trim());
      } else {
        return [];
      }
    }
    
    return languages.map(lang => {
      if (typeof lang === 'object') return lang;
      
      // Normalize language names
      const langMappings = {
        'english': ['english', 'en', 'eng'],
        'spanish': ['spanish', 'español', 'es', 'spa'],
        'french': ['french', 'français', 'fr', 'fra'],
        'german': ['german', 'deutsch', 'de', 'deu'],
        'chinese': ['chinese', 'mandarin', '中文', 'zh', 'chi'],
        'japanese': ['japanese', '日本語', 'ja', 'jpn'],
        'korean': ['korean', '한국어', 'ko', 'kor'],
        'portuguese': ['portuguese', 'português', 'pt', 'por'],
        'italian': ['italian', 'italiano', 'it', 'ita'],
        'russian': ['russian', 'русский', 'ru', 'rus']
      };
      
      const langLower = lang.toLowerCase();
      for (const [standard, variations] of Object.entries(langMappings)) {
        if (variations.includes(langLower)) {
          return { name: standard, proficiency: 'native' };
        }
      }
      
      return { name: lang, proficiency: 'unknown' };
    });
  }

  calculateIncomeRange(income) {
    if (!income) return '';
    
    // Extract numeric value from income
    const numericIncome = typeof income === 'number' ? income : parseInt(income.toString().replace(/[^\d]/g, ''));
    
    if (numericIncome < 25000) return 'under $25,000';
    if (numericIncome < 50000) return '$25,000-$49,999';
    if (numericIncome < 75000) return '$50,000-$74,999';
    if (numericIncome < 100000) return '$75,000-$99,999';
    if (numericIncome < 150000) return '$100,000-$149,999';
    return '$150,000+';
  }

  calculateExperienceLevel(years) {
    if (!years || years < 0) return 'entry';
    if (years <= 2) return 'entry';
    if (years <= 5) return 'mid';
    if (years <= 10) return 'senior';
    return 'lead';
  }

  createSearchableText(profile) {
    const searchableFields = [
      profile.identity.fullName,
      profile.identity.firstName,
      profile.identity.lastName,
      profile.contact.email,
      profile.address.city,
      profile.address.state,
      profile.address.country,
      profile.employment.company,
      profile.employment.jobTitle,
      profile.employment.industry,
      profile.education.level,
      profile.education.currentInstitution,
      profile.skills.technical.join(' '),
      profile.skills.languages.map(l => l.name).join(' '),
      profile.personal.interests.join(' ')
    ];
    
    return searchableFields
      .filter(field => field && field.toString().trim())
      .join(' ')
      .toLowerCase();
  }

  extractMatchingKeywords(profile) {
    const keywords = new Set();
    
    // Add normalized values as keywords
    const addKeywords = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && value.trim()) {
          keywords.add(value.toLowerCase().trim());
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'string') keywords.add(item.toLowerCase().trim());
            else if (typeof item === 'object' && item.name) keywords.add(item.name.toLowerCase().trim());
          });
        } else if (typeof value === 'object' && value !== null) {
          addKeywords(value);
        }
      }
    };
    
    addKeywords(profile);
    
    return Array.from(keywords);
  }

  generateCategoryTags(profile) {
    const tags = [];
    
    // Demographics
    if (profile.identity.ageRange) tags.push(`age_${profile.identity.ageRange.replace(/[^a-z0-9]/g, '_')}`);
    if (profile.identity.gender) tags.push(`gender_${profile.identity.gender.toLowerCase()}`);
    if (profile.address.country) tags.push(`country_${profile.address.countryCode || profile.address.country}`.toLowerCase());
    if (profile.address.state) tags.push(`state_${profile.address.stateCode || profile.address.state}`.toLowerCase());
    
    // Professional
    if (profile.employment.industryNormalized) tags.push(`industry_${profile.employment.industryNormalized}`);
    if (profile.employment.experienceLevel) tags.push(`experience_${profile.employment.experienceLevel}`);
    if (profile.education.levelCategory) tags.push(`education_${profile.education.levelCategory}`);
    
    // Personal
    if (profile.personal.maritalStatusNormalized) tags.push(`marital_${profile.personal.maritalStatusNormalized.replace(/\s+/g, '_')}`);
    if (profile.personal.hasChildren) tags.push('has_children');
    
    // Preferences
    tags.push(`communication_${profile.preferences.communication.preferredContact}`);
    if (profile.preferences.privacy.marketing) tags.push('accepts_marketing');
    if (profile.preferences.privacy.newsletter) tags.push('accepts_newsletter');
    
    return tags;
  }

  calculateFieldConfidences(enhanced, original) {
    const confidences = {};
    
    // Calculate confidence based on data completeness and inference quality
    const calculateConfidence = (field, originalField) => {
      if (!originalField && !field) return 0;
      if (originalField && field === originalField) return 1.0; // Exact match
      if (originalField && field) return 0.8; // Derived/normalized
      if (!originalField && field) return 0.6; // Inferred
      return 0.3; // Low confidence
    };
    
    confidences.identity = {
      firstName: calculateConfidence(enhanced.identity.firstName, original.firstName),
      lastName: calculateConfidence(enhanced.identity.lastName, original.lastName),
      gender: calculateConfidence(enhanced.identity.gender, original.gender),
      age: calculateConfidence(enhanced.identity.age, original.age),
      ageRange: enhanced.identity.age ? 0.9 : 0.5
    };
    
    confidences.contact = {
      email: calculateConfidence(enhanced.contact.email, original.email),
      phone: calculateConfidence(enhanced.contact.phone, original.phone)
    };
    
    confidences.address = {
      country: calculateConfidence(enhanced.address.country, original.country),
      state: calculateConfidence(enhanced.address.state, original.state),
      city: calculateConfidence(enhanced.address.city, original.city)
    };
    
    confidences.employment = {
      status: calculateConfidence(enhanced.employment.status, original.employmentStatus),
      company: calculateConfidence(enhanced.employment.company, original.company),
      industry: calculateConfidence(enhanced.employment.industry, original.industry),
      jobTitle: calculateConfidence(enhanced.employment.jobTitle, original.jobTitle)
    };
    
    confidences.education = {
      level: calculateConfidence(enhanced.education.level, original.educationLevel),
      institution: calculateConfidence(enhanced.education.currentInstitution, original.school)
    };
    
    return confidences;
  }

  // Utility methods for profile operations

  /**
   * Get the best value for a given field with confidence score
   * @param {string} fieldPath - Dot notation path to field (e.g., 'identity.firstName')
   * @returns {Object} { value, confidence, alternatives }
   */
  getBestValue(fieldPath) {
    const pathParts = fieldPath.split('.');
    let value = this.profile;
    
    // Navigate to the field
    for (const part of pathParts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        value = null;
        break;
      }
    }
    
    // Get confidence if available
    let confidence = 0.5; // default
    if (this.profile.computed && this.profile.computed.confidenceScores) {
      const confidencePath = pathParts.slice(0, -1).join('.');
      const fieldName = pathParts[pathParts.length - 1];
      const sectionConfidence = this.profile.computed.confidenceScores[confidencePath];
      if (sectionConfidence && sectionConfidence[fieldName]) {
        confidence = sectionConfidence[fieldName];
      }
    }
    
    // Find alternatives (different representations of same data)
    const alternatives = this.findAlternatives(fieldPath, value);
    
    return {
      value: value,
      confidence: confidence,
      alternatives: alternatives
    };
  }

  findAlternatives(fieldPath, currentValue) {
    const alternatives = [];
    
    // Add alternatives based on field type
    if (fieldPath.includes('country')) {
      if (this.profile.address.countryCode) alternatives.push(this.profile.address.countryCode);
      if (this.profile.address.countryName) alternatives.push(this.profile.address.countryName);
    }
    
    if (fieldPath.includes('state')) {
      if (this.profile.address.stateCode) alternatives.push(this.profile.address.stateCode);
      if (this.profile.address.stateName) alternatives.push(this.profile.address.stateName);
    }
    
    if (fieldPath.includes('education')) {
      if (this.profile.education.levelNormalized) alternatives.push(this.profile.education.levelNormalized);
      if (this.profile.education.levelCategory) alternatives.push(this.profile.education.levelCategory);
    }
    
    if (fieldPath.includes('employment.status')) {
      if (this.profile.employment.statusNormalized) alternatives.push(this.profile.employment.statusNormalized);
      if (this.profile.employment.statusCategory) alternatives.push(this.profile.employment.statusCategory);
    }
    
    return alternatives.filter(alt => alt !== currentValue);
  }

  /**
   * Search for matching fields based on query
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Matching fields with scores
   */
  searchFields(query, options = {}) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    // Search in computed keywords
    const keywords = this.profile.computed.matchingKeywords;
    const matchingKeywords = keywords.filter(keyword => 
      keyword.includes(queryLower) || queryLower.includes(keyword)
    );
    
    // Search in searchable text
    const searchText = this.profile.computed.searchableText;
    const textMatch = searchText.includes(queryLower);
    
    // Calculate relevance scores
    if (matchingKeywords.length > 0) {
      results.push({
        type: 'keyword_match',
        matches: matchingKeywords,
        score: Math.min(matchingKeywords.length * 0.2, 1.0)
      });
    }
    
    if (textMatch) {
      results.push({
        type: 'text_match',
        score: 0.6
      });
    }
    
    // Check category tags
    const categoryTags = this.profile.computed.categoryTags;
    const matchingTags = categoryTags.filter(tag => 
      tag.includes(queryLower) || queryLower.includes(tag.replace(/_/g, ' '))
    );
    
    if (matchingTags.length > 0) {
      results.push({
        type: 'category_match',
        matches: matchingTags,
        score: matchingTags.length * 0.15
      });
    }
    
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Export profile in different formats for form filling
   * @param {string} format - Export format ('flat', 'hierarchical', 'keywords')
   * @returns {Object} Formatted profile data
   */
  export(format = 'hierarchical') {
    switch (format) {
      case 'flat':
        return this.exportFlat();
      case 'keywords':
        return this.exportKeywords();
      case 'hierarchical':
      default:
        return this.profile;
    }
  }

  exportFlat() {
    const flat = {};
    
    const flatten = (obj, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, newKey);
        } else {
          flat[newKey] = value;
        }
      }
    };
    
    flatten(this.profile);
    return flat;
  }

  exportKeywords() {
    return {
      keywords: this.profile.computed.matchingKeywords,
      categoryTags: this.profile.computed.categoryTags,
      searchableText: this.profile.computed.searchableText
    };
  }

  /**
   * Update profile data while maintaining normalization
   * @param {Object} updates - Updates to apply
   */
  update(updates) {
    // Merge updates with existing profile
    const mergedData = this.deepMerge(this.exportFlat(), updates);
    
    // Re-normalize with updated data
    this.profile = this.normalizeProfile(mergedData);
    this.metadata.lastModified = new Date().toISOString();
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(result[key] || {}, value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }

  // Additional helper methods (abbreviated for space)
  formatPhone(phone) { return phone || ''; }
  formatPhoneInternational(phone) { return phone || ''; }
  getStateCode(state) { return state || ''; }
  getStateName(state) { return state || ''; }
  getCountryCode(country) { return country || ''; }
  getCountryName(country) { return country || ''; }
  formatFullAddress(data) { return ''; }
  formatInternationalAddress(data) { return ''; }
  extractStreetNumber(street) { return ''; }
  extractStreetName(street) { return ''; }
  normalizeInstitutions(institutions) { return institutions; }
  normalizeDegrees(degrees) { return degrees; }
  normalizeCertifications(certs) { return certs; }
  extractGraduationYear(data) { return null; }
  normalizeJobHistory(jobs) { return jobs; }
  normalizeJobTitle(title) { return title || ''; }
  inferJobLevel(title, experience) { return ''; }
  categorizeIndustry(industry) { return ''; }
  inferCurrency(country) { return 'USD'; }
  normalizeSkills(skills) { return skills || []; }
  extractProgrammingSkills(data) { return []; }
  extractSoftwareSkills(data) { return []; }
  normalizeSoftSkills(skills) { return skills || []; }
  normalizeLanguageProficiency(prof) { return prof; }
  normalizeSkillLevels(levels) { return levels; }
  calculateOverallExpertise(data) { return 'intermediate'; }
  inferHasChildren(data) { return false; }
  normalizeInterests(interests) { return interests || []; }
  categorizeInterests(interests) { return []; }
  calculatePreferredPriceRange(data) { return 'medium'; }
  categorizeObjective(objective) { return ''; }
  inferPreferences(data) { return {}; }
  inferPersonalityTraits(data) { return []; }
  inferTimezone(country) { return 'UTC'; }
}