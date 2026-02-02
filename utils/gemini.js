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
      You are an AI assistant helping to analyze multiple choice questions and select the best answer.
      
      **Question**: ${question}
      
      **Options**:
      ${options.map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`).join('\n')}
      
      **Context**: ${context}
      
      **User Profile**: ${JSON.stringify(userProfile, null, 2)}
      
      **Instructions**:
      1. Analyze each option carefully
      2. Consider the context and user profile when relevant
      3. Select the most appropriate answer with reasoning
      4. Provide confidence level for the selection
      
      **Response Format** (JSON only):
      {
        "selectedOption": "A",
        "selectedValue": "Full text of selected option",
        "confidence": 0.92,
        "reasoning": "Detailed explanation of why this option was selected",
        "optionAnalysis": [
          {
            "option": "A",
            "score": 0.92,
            "analysis": "Why this option is/isn't the best choice"
          }
        ]
      }
    `;

    const text = await this.generateContent(prompt, {
      temperature: 0.2,
      maxTokens: 1024
    });
    return this.safeParseJSON(text, { selectedOption: '', selectedValue: '', confidence: 0, reasoning: '', optionAnalysis: [] });
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