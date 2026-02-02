// Gemini API integration (via secure proxy). NO API KEYS IN CLIENT CODE.
export class GeminiAPI {
  constructor() {
    // Configure a server-side proxy endpoint that attaches API keys securely.
    // Example: Vercel/Netlify/Cloudflare Worker URL
    this.proxyURL = 'https://YOUR_AI_PROXY_URL/generate';
  }

  async generateContent(prompt, options = {}) {
    try {
      const response = await fetch(this.proxyURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          options: {
            temperature: options.temperature ?? 0.7,
            topK: options.topK ?? 40,
            topP: options.topP ?? 0.95,
            maxTokens: options.maxTokens ?? 1024,
            ...options.config,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI proxy error: ${response.status} - ${errorText}`);
      }

      // Expect proxy to return { text: "..." } or raw text
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (typeof data.text === 'string') return data.text;
        // Fallbacks: some proxies may return {response: '...'}
        if (typeof data.response === 'string') return data.response;
        throw new Error('Invalid proxy JSON format');
      }
      return await response.text();
    } catch (error) {
      console.error('Gemini proxy call failed:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async analyzeFormFields(formFields, userProfile, domain) {
    const prompt = `
      You are an AI assistant specialized in form field analysis and autofill suggestions.
      
      Task: Analyze the following web form and provide intelligent autofill suggestions based on the user's profile.
      
      Form Information:
      Domain: ${domain}
      Fields: ${JSON.stringify(formFields, null, 2)}
      
      User Profile:
      ${JSON.stringify(userProfile, null, 2)}
      
      Response Format (strict JSON only, no markdown, no commentary):
      {
        "suggestions": [
          {
            "fieldIndex": 0,
            "profileKey": "firstName",
            "confidence": 0.95,
            "reasoning": "Field labeled 'First Name' matches firstName"
          }
        ]
      }
    `;

    const text = await this.generateContent(prompt, {
      temperature: 0.2,
      maxTokens: 1200,
    });
    return this.safeParseJSON(text, { suggestions: [] });
  }

  async generateEssayResponse(question, context, userProfile, requirements = {}) {
    const prompt = `
      You are an AI assistant helping to generate professional responses to essay questions or open-ended prompts.
      
      **Question/Prompt**: ${question}
      
      **Context**: ${context}
      
      **User Profile**:
      ${JSON.stringify(userProfile, null, 2)}
      
      **Requirements**:
      - Word limit: ${requirements.wordLimit || 'No specific limit'}
      - Tone: ${requirements.tone || 'Professional'}
      - Focus areas: ${requirements.focus || 'Based on user profile'}
      
      **Instructions**:
      1. Generate a well-structured, professional response
      2. Draw from relevant information in the user profile
      3. Maintain authenticity while highlighting strengths
      4. Use appropriate formatting (paragraphs, bullet points if needed)
      5. Ensure the response directly addresses the question
      
      **Response Format** (JSON only):
      {
        "response": "Generated essay/response text",
        "wordCount": 250,
        "confidence": 0.88,
        "keyPoints": ["Main point 1", "Main point 2"],
        "reasoning": "Why this response is appropriate for the user",
        "suggestions": ["Optional improvements or alternatives"]
      }
    `;

    const text = await this.generateContent(prompt, {
      temperature: 0.6,
      maxTokens: 1500
    });
    return this.safeParseJSON(text, { response: '', wordCount: 0, confidence: 0, keyPoints: [], reasoning: '', suggestions: [] });
  }

  async analyzeMCQOptions(question, options, context, userProfile) {
    const prompt = `
      You are an AI assistant specialized in analyzing multiple choice questions and dropdown selections for form autofill.
      
      **Question/Field**: ${question}
      
      **Available Options**:
      ${options.map((option, index) => {
        const text = option.text || option.value || option;
        const value = option.value || option;
        return `${String.fromCharCode(65 + index)}. Text: "${text}" | Value: "${value}"`;
      }).join('\n')}
      
      **Context**: ${context || 'General form field'}
      **Domain**: ${context.domain || 'Unknown'}
      
      **User Profile**: ${JSON.stringify(userProfile, null, 2)}
      
      **Instructions**:
      1. Analyze each option in relation to the user's profile data
      2. Consider semantic meaning, not just exact text matches
      3. Account for common variations and synonyms
      4. For geographic data (countries, states), use standard names and codes
      5. For categorical data (education, employment), map to closest equivalent
      6. Provide high confidence for exact matches, moderate for semantic matches
      7. If no good match exists, return low confidence with reasoning
      
      **Special Considerations**:
      - Countries: Match full names, codes (US, USA), and variations (United States, America)
      - States: Match full names, abbreviations (CA, California)
      - Education: Map degree levels appropriately (Bachelor's → Bachelor Degree)
      - Employment: Match industry terms and job categories
      - Yes/No questions: Interpret user intent from profile context
      - Date ranges: Match user's age or dates to appropriate ranges
      
      **Response Format** (JSON only, no markdown):
      {
        "selectedOption": "A",
        "selectedValue": "Full text of selected option",
        "optionValue": "Option value if different from text",
        "confidence": 0.92,
        "matchType": "exact|semantic|contextual|fallback",
        "reasoning": "Detailed explanation including what user data was matched and why",
        "profileFieldUsed": "firstName|country|industry|etc",
        "alternativeOptions": [
          {
            "option": "B",
            "confidence": 0.65,
            "reasoning": "Why this could also be a match"
          }
        ],
        "optionAnalysis": [
          {
            "option": "A",
            "score": 0.92,
            "matchingFactors": ["exact text match", "profile field alignment"],
            "analysis": "Detailed analysis of this option"
          }
        ]
      }
    `;

    const text = await this.generateContent(prompt, {
      temperature: 0.2,
      maxTokens: 1500
    });
    return this.safeParseJSON(text, { 
      selectedOption: '', 
      selectedValue: '', 
      optionValue: '',
      confidence: 0, 
      matchType: 'fallback',
      reasoning: 'No suitable match found', 
      profileFieldUsed: null,
      alternativeOptions: [],
      optionAnalysis: [] 
    });
  }

  async analyzeDropdownContext(fieldInfo, options, userProfile, formContext) {
    const prompt = `
      You are an AI assistant specialized in understanding dropdown field context and user intent.
      
      **Field Information**:
      - Label: ${fieldInfo.label || 'N/A'}
      - Placeholder: ${fieldInfo.placeholder || 'N/A'}
      - Name: ${fieldInfo.name || 'N/A'}
      - ID: ${fieldInfo.id || 'N/A'}
      - Type: ${fieldInfo.type || 'N/A'}
      - Context: ${fieldInfo.context || 'Unknown'}
      
      **Available Options** (${options.length} total):
      ${options.slice(0, 20).map((opt, idx) => {
        const text = opt.text || opt.value || opt;
        const value = opt.value || opt;
        return `${idx + 1}. "${text}" (value: "${value}")`;
      }).join('\n')}${options.length > 20 ? `\n... and ${options.length - 20} more options` : ''}
      
      **User Profile**:
      ${JSON.stringify(userProfile, null, 2)}
      
      **Form Context**:
      - Domain: ${formContext.domain || 'Unknown'}
      - Page URL: ${formContext.url || 'Unknown'}
      - Form Type: ${formContext.formType || 'Unknown'}
      
      **Task**: Determine the field type and provide intelligent matching suggestions.
      
      **Instructions**:
      1. Identify what type of data this dropdown represents (country, state, category, etc.)
      2. Determine the most likely user intent based on field labels and context
      3. Find the best matching options from user profile data
      4. Consider variations, synonyms, and common alternatives
      5. Rank multiple potential matches with confidence scores
      6. Provide detailed reasoning for your recommendations
      
      **Response Format** (JSON only):
      {
        "fieldType": "country|state|industry|education|employment|language|skill_level|age_range|income|generic",
        "fieldIntent": "What the field is asking for in plain English",
        "primaryMatch": {
          "optionIndex": 5,
          "optionText": "Selected option text",
          "optionValue": "Selected option value",
          "confidence": 0.95,
          "matchType": "exact|semantic|contextual",
          "reasoning": "Why this option was selected",
          "profileSource": "Which profile field was used"
        },
        "alternativeMatches": [
          {
            "optionIndex": 8,
            "optionText": "Alternative option",
            "confidence": 0.75,
            "reasoning": "Why this could also work"
          }
        ],
        "userProfileAnalysis": {
          "relevantFields": ["country", "state", "industry"],
          "missingFields": ["educationLevel"],
          "fieldQuality": "good|partial|poor",
          "suggestions": ["Add education level to profile for better matching"]
        },
        "contextualInsights": {
          "domainType": "job_application|e_commerce|registration|survey",
          "expectedFormat": "full_name|abbreviation|code",
          "commonPatterns": ["Most options follow standard format"],
          "anomalies": ["Unusual option formats detected"]
        },
        "overallAssessment": {
          "matchQuality": "excellent|good|fair|poor",
          "confidence": 0.88,
          "reasoning": "Overall assessment of the matching process",
          "recommendations": ["Specific actions to improve matching"]
        }
      }
    `;

    const text = await this.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 2000
    });
    
    return this.safeParseJSON(text, {
      fieldType: 'generic',
      fieldIntent: 'Unknown field type',
      primaryMatch: null,
      alternativeMatches: [],
      userProfileAnalysis: {
        relevantFields: [],
        missingFields: [],
        fieldQuality: 'poor',
        suggestions: []
      },
      contextualInsights: {
        domainType: 'unknown',
        expectedFormat: 'unknown',
        commonPatterns: [],
        anomalies: []
      },
      overallAssessment: {
        matchQuality: 'poor',
        confidence: 0,
        reasoning: 'Unable to analyze field context',
        recommendations: []
      }
    });
  }

  async classifyFormSecurity(domain, formFields) {
    const prompt = `
      Analyze the security and trustworthiness of this form for autofill purposes.
      
      Domain: ${domain}
      Form fields: ${JSON.stringify(formFields, null, 2)}
      
      Provide a security assessment in JSON format:
      {
        "trustLevel": "high|medium|low",
        "securityScore": 0.85,
        "sensitiveFields": ["field1", "field2"],
        "recommendations": ["security recommendations"],
        "allowAutofill": true,
        "reasoning": "Why this domain/form is trustworthy or not"
      }
    `;

    const text = await this.generateContent(prompt, {
      temperature: 0.1,
      maxTokens: 512
    });
    return this.safeParseJSON(text, { trustLevel: 'medium', securityScore: 0.5, sensitiveFields: [], recommendations: [], allowAutofill: true, reasoning: '' });
  }

  safeParseJSON(text, fallback) {
    try {
      // Remove possible code fences if any
      const clean = text.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(clean);
    } catch (e) {
      console.warn('Failed to parse AI JSON, returning fallback.', e, text);
      return fallback;
    }
  }
}