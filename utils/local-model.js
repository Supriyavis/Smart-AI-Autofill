// Local pre-trained model integration using TensorFlow.js
export class LocalModelManager {
  constructor() {
    this.models = new Map();
    this.modelLoadPromises = new Map();
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Import TensorFlow.js - you'll need to add this to your manifest.json
      // Add to manifest: "web_accessible_resources": ["models/*", "tfjs/*"]
      if (!window.tf) {
        console.warn('TensorFlow.js not loaded. Loading from CDN...');
        await this.loadTensorFlow();
      }
      
      this.isInitialized = true;
      console.log('Local model manager initialized');
    } catch (error) {
      console.error('Failed to initialize local models:', error);
      throw error;
    }
  }

  async loadTensorFlow() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.15.0/dist/tf.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Load a pre-trained model for text classification/field matching
   * @param {string} modelName - Name identifier for the model
   * @param {string} modelUrl - URL or path to the model
   * @param {Object} config - Model configuration
   */
  async loadModel(modelName, modelUrl, config = {}) {
    if (this.models.has(modelName)) {
      return this.models.get(modelName);
    }

    if (this.modelLoadPromises.has(modelName)) {
      return this.modelLoadPromises.get(modelName);
    }

    const loadPromise = this._loadModelInternal(modelName, modelUrl, config);
    this.modelLoadPromises.set(modelName, loadPromise);
    
    try {
      const model = await loadPromise;
      this.models.set(modelName, model);
      return model;
    } catch (error) {
      this.modelLoadPromises.delete(modelName);
      throw error;
    }
  }

  async _loadModelInternal(modelName, modelUrl, config) {
    await this.initialize();
    
    console.log(`Loading model: ${modelName} from ${modelUrl}`);
    
    try {
      const model = await tf.loadLayersModel(modelUrl);
      console.log(`Model ${modelName} loaded successfully`);
      
      return {
        model: model,
        config: config,
        predict: (input) => this.predict(modelName, input)
      };
    } catch (error) {
      console.error(`Failed to load model ${modelName}:`, error);
      throw error;
    }
  }

  /**
   * Load popular pre-trained models for form filling tasks
   */
  async loadDefaultModels() {
    const models = [
      {
        name: 'field_classifier',
        // You can host your own models or use public ones
        url: chrome.runtime.getURL('models/field_classifier/model.json'),
        config: {
          inputShape: [100], // embedding dimension
          outputClasses: ['name', 'email', 'phone', 'address', 'other'],
          threshold: 0.7
        }
      },
      {
        name: 'text_embedder',
        url: chrome.runtime.getURL('models/universal_sentence_encoder/model.json'),
        config: {
          inputShape: [512], // USE embedding dimension
          type: 'sentence_encoder'
        }
      }
    ];

    const loadPromises = models.map(({ name, url, config }) => 
      this.loadModel(name, url, config).catch(error => {
        console.warn(`Failed to load ${name}:`, error);
        return null;
      })
    );

    const results = await Promise.all(loadPromises);
    return results.filter(Boolean);
  }

  /**
   * Use Universal Sentence Encoder for semantic similarity
   * @param {string} text1 - First text to compare
   * @param {string} text2 - Second text to compare
   * @returns {number} Similarity score between 0 and 1
   */
  async calculateSemanticSimilarity(text1, text2) {
    try {
      const embedder = this.models.get('text_embedder');
      if (!embedder) {
        // Fallback to simple text similarity
        return this.calculateSimpleTextSimilarity(text1, text2);
      }

      const embedding1 = await this.getTextEmbedding(text1);
      const embedding2 = await this.getTextEmbedding(text2);
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(embedding1, embedding2);
      return similarity;
    } catch (error) {
      console.warn('Semantic similarity failed, using fallback:', error);
      return this.calculateSimpleTextSimilarity(text1, text2);
    }
  }

  async getTextEmbedding(text) {
    const embedder = this.models.get('text_embedder');
    if (!embedder) throw new Error('Text embedder not loaded');

    // Preprocess text (tokenization would happen here)
    const processedText = this.preprocessText(text);
    
    // For demonstration - in reality you'd need proper tokenization
    const input = tf.tensor2d([processedText], [1, processedText.length]);
    const embedding = embedder.model.predict(input);
    
    return embedding.arraySync()[0];
  }

  preprocessText(text) {
    // Simple preprocessing - in a real implementation you'd use proper tokenization
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1)
      .slice(0, 50) // Limit to 50 tokens
      .map((word, index) => this.getWordHash(word) % 10000); // Simple hash to numeric
  }

  getWordHash(word) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      const char = word.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  calculateSimpleTextSimilarity(text1, text2) {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Classify form field type using pre-trained model
   * @param {Object} fieldInfo - Field information from form analysis
   * @returns {Object} Classification result with confidence
   */
  async classifyField(fieldInfo) {
    try {
      const classifier = this.models.get('field_classifier');
      if (!classifier) {
        return this.fallbackClassification(fieldInfo);
      }

      // Create feature vector from field information
      const features = this.extractFieldFeatures(fieldInfo);
      const input = tf.tensor2d([features], [1, features.length]);
      
      const predictions = classifier.model.predict(input);
      const scores = predictions.arraySync()[0];
      
      const classes = classifier.config.outputClasses;
      const results = classes.map((className, index) => ({
        class: className,
        confidence: scores[index]
      }));
      
      results.sort((a, b) => b.confidence - a.confidence);
      
      const bestResult = results[0];
      const threshold = classifier.config.threshold || 0.5;
      
      return {
        predictedClass: bestResult.confidence > threshold ? bestResult.class : 'other',
        confidence: bestResult.confidence,
        allResults: results,
        method: 'ml_model'
      };
    } catch (error) {
      console.warn('Field classification failed, using fallback:', error);
      return this.fallbackClassification(fieldInfo);
    }
  }

  extractFieldFeatures(fieldInfo) {
    // Create a feature vector from field information
    // This is a simplified version - in production you'd want more sophisticated features
    const features = new Array(100).fill(0);
    
    // Text-based features (simplified bag-of-words approach)
    const allText = [
      fieldInfo.id || '',
      fieldInfo.name || '',
      fieldInfo.placeholder || '',
      fieldInfo.label || '',
      fieldInfo.ariaLabel || ''
    ].join(' ').toLowerCase();
    
    // Simple feature extraction
    const keywords = {
      'name': [0, 1, 2, 3],
      'email': [4, 5, 6, 7],
      'phone': [8, 9, 10, 11],
      'address': [12, 13, 14, 15],
      'first': [16, 17, 18, 19],
      'last': [20, 21, 22, 23],
      'zip': [24, 25, 26, 27],
      'city': [28, 29, 30, 31],
      'state': [32, 33, 34, 35]
    };
    
    for (const [keyword, indices] of Object.entries(keywords)) {
      if (allText.includes(keyword)) {
        indices.forEach(index => features[index] = 1);
      }
    }
    
    // Type-based features
    const typeIndex = ['text', 'email', 'tel', 'url', 'search'].indexOf(fieldInfo.type);
    if (typeIndex >= 0) {
      features[50 + typeIndex] = 1;
    }
    
    return features;
  }

  fallbackClassification(fieldInfo) {
    // Rule-based fallback when model is not available
    const text = [
      fieldInfo.id,
      fieldInfo.name,
      fieldInfo.placeholder,
      fieldInfo.label,
      fieldInfo.ariaLabel
    ].join(' ').toLowerCase();
    
    const rules = [
      { pattern: /first.*name|fname|given/i, class: 'firstName', confidence: 0.9 },
      { pattern: /last.*name|lname|surname|family/i, class: 'lastName', confidence: 0.9 },
      { pattern: /email|mail/i, class: 'email', confidence: 0.95 },
      { pattern: /phone|tel|mobile|cell/i, class: 'phone', confidence: 0.9 },
      { pattern: /address|street|addr/i, class: 'address', confidence: 0.85 },
      { pattern: /city|town/i, class: 'city', confidence: 0.8 },
      { pattern: /state|province|region/i, class: 'state', confidence: 0.8 },
      { pattern: /zip|postal|postcode/i, class: 'zipCode', confidence: 0.9 }
    ];
    
    for (const rule of rules) {
      if (rule.pattern.test(text)) {
        return {
          predictedClass: rule.class,
          confidence: rule.confidence,
          method: 'rule_based'
        };
      }
    }
    
    return {
      predictedClass: 'other',
      confidence: 0.3,
      method: 'rule_based'
    };
  }

  /**
   * Generate text embeddings for profile matching
   * @param {string} text - Text to embed
   * @returns {Array} Embedding vector
   */
  async embedText(text) {
    try {
      return await this.getTextEmbedding(text);
    } catch (error) {
      console.warn('Text embedding failed:', error);
      // Return simple hash-based "embedding"
      return this.preprocessText(text).slice(0, 50);
    }
  }

  /**
   * Find best profile field match using semantic similarity
   * @param {string} fieldText - Text describing the form field
   * @param {Object} profileData - User profile data
   * @returns {Object} Best match with confidence
   */
  async findBestProfileMatch(fieldText, profileData) {
    const fieldEmbedding = await this.embedText(fieldText);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [key, value] of Object.entries(profileData)) {
      if (!value || typeof value !== 'string') continue;
      
      try {
        const profileEmbedding = await this.embedText(`${key}: ${value}`);
        const similarity = this.cosineSimilarity(fieldEmbedding, profileEmbedding);
        
        if (similarity > bestScore) {
          bestScore = similarity;
          bestMatch = {
            profileKey: key,
            value: value,
            confidence: similarity,
            method: 'semantic_embedding'
          };
        }
      } catch (error) {
        console.warn(`Error processing profile field ${key}:`, error);
      }
    }
    
    return bestMatch || {
      profileKey: null,
      value: null,
      confidence: 0,
      method: 'no_match'
    };
  }

  /**
   * Clean up models and free memory
   */
  dispose() {
    for (const [name, modelData] of this.models) {
      try {
        if (modelData.model && typeof modelData.model.dispose === 'function') {
          modelData.model.dispose();
        }
      } catch (error) {
        console.warn(`Error disposing model ${name}:`, error);
      }
    }
    
    this.models.clear();
    this.modelLoadPromises.clear();
    this.isInitialized = false;
  }

  /**
   * Get model info and status
   */
  getModelInfo() {
    const info = {};
    for (const [name, modelData] of this.models) {
      info[name] = {
        loaded: true,
        config: modelData.config,
        inputShape: modelData.model?.inputs?.[0]?.shape,
        outputShape: modelData.model?.outputs?.[0]?.shape
      };
    }
    return info;
  }
}