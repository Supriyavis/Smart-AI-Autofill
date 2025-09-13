// Gemini API integration
export class GeminiAPI {
  constructor() {
    // In production, this key should be stored securely on the server
    // NEVER expose API keys in client-side code
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB3rWKBuqOTrV0uM1v3GSXpWhGy2CukEEA'; // Rounak Mishra is the owner of this API
  }

  async generateContent(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
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
            temperature: options.temperature || 0.7,
            topK: options.topK || 40,
            topP: options.topP || 0.95,
            maxOutputTokens: options.maxTokens || 1024,
            ...options.config
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async analyzeFormFields(formFields, userProfile, domain) {
    const prompt = `
      You are an AI assistant specialized in form field analysis and autofill suggestions.
      
      **Task**: Analyze the following web form and provide intelligent autofill suggestions based on the user's profile.
      
      **Form Information**:
      Domain: ${domain}
      Fields: ${JSON.stringify(formFields, null, 2)}
      
      **User Profile**:
      ${JSON.stringify(userProfile, null, 2)}
      
      **Instructions**:
      1. For each form field, determine the most appropriate value from the user profile
      2. Classify each field type (name, email, phone, address, education, experience, skills, etc.)
      3. Assign a confidence score (0.0 to 1.0) based on how certain you are about the match
      4. Provide reasoning for each suggestion
      5. Consider context clues from field names, labels, and placeholders
      
      **Confidence Guidelines**:
      - 0.9-1.0: Perfect match (e.g., "email" field with user's email)
      - 0.7-0.8: High confidence (e.g., "first_name" with user's firstName)
      - 0.5-0.6: Medium confidence (contextual match)
      - 0.0-0.4: Low confidence (uncertain or no match)
      
      **Response Format** (JSON only, no other text):
      {
        "suggestions": [
          {
            "fieldId": "field_identifier",
            "fieldName": "field_name_or_label",
            "classification": "field_type",
            "suggestedValue": "value_from_profile",
            "confidence": 0.95,
            "reasoning": "Clear explanation of why this value was chosen"
          }
        ],
        "overallConfidence": 0.85,
        "domainTrust": "high|medium|low",
        "recommendations": ["Any additional notes or recommendations"]
      }
    `;

    return await this.generateContent(prompt, {
      temperature: 0.3,
      maxTokens: 2048
    });
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

    return await this.generateContent(prompt, {
      temperature: 0.6,
      maxTokens: 1500
    });
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

    return await this.generateContent(prompt, {
      temperature: 0.2,
      maxTokens: 1024
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

    return await this.generateContent(prompt, {
      temperature: 0.1,
      maxTokens: 512
    });
  }
}