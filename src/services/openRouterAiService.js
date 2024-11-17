// openRouterService.js
import axiosInstance from './axiosInstance';

const DEFAULT_MODEL = 'mistralai/mistral-7b-instruct';
const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;

class OpenRouterService {
  constructor() {
    this.endpoint = '/chat/completions';
  }

  async generateContent(prompt, options = {}) {
    try {
      const {
        model = DEFAULT_MODEL,
        maxTokens = DEFAULT_MAX_TOKENS,
        temperature = DEFAULT_TEMPERATURE,
      } = options;

      const response = await axiosInstance.post(this.endpoint, {
        model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const result = response.data.choices[0]?.message?.content;
      
      if (!result) {
        throw new Error('No response content received from OpenRouter');
      }

      return result;

    } catch (error) {
      // Log the full error for debugging
      console.error('OpenRouter Service Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Throw a user-friendly error
      throw new Error('Failed to generate content. Please try again later.');
    }
  }

  // Method to check API status
  async checkStatus() {
    try {
      const response = await axiosInstance.get('/status');
      return response.data;
    } catch (error) {
      console.error('Failed to check API status:', error);
      throw error;
    }
  }

  // Method to list available models
  async listModels() {
    try {
      const response = await axiosInstance.get('/models');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch models:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const openRouterService = new OpenRouterService();
export default openRouterService;