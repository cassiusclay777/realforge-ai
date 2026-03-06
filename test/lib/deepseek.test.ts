import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkDeepSeekHealth, analyzeImageWithDeepSeek, generateContentWithDeepSeek } from '@/lib/deepseek';
import type { DeepSeekImageAnalysis, DeepSeekContentGeneration } from '@/lib/deepseek';

// Mock OpenAI
vi.mock('openai', () => {
  const mockChatCompletions = {
    create: vi.fn(),
  };

  const mockModels = {
    list: vi.fn(),
  };

  const mockChat = {
    completions: mockChatCompletions,
  };

  const mockOpenAI = vi.fn(() => ({
    chat: mockChat,
    models: mockModels,
  }));

  return {
    default: mockOpenAI,
  };
});

// Mock dotenv
vi.mock('dotenv', async () => {
  const actual = await vi.importActual<typeof import('dotenv')>('dotenv');
  return {
    ...actual,
    config: vi.fn(),
  };
});

describe('DeepSeek API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.DEEPSEEK_API_KEY = 'test-key';
    process.env.DEEPSEEK_API_URL = 'https://api.deepseek.com';
  });

  describe('Health check', () => {
    it('should return true when API is healthy', async () => {
      const { default: OpenAI } = await import('openai');
      const mockOpenAIInstance = new (OpenAI as any)();
      mockOpenAIInstance.models.list.mockResolvedValue({});

      const result = await checkDeepSeekHealth();
      expect(result).toBe(true);
      expect(mockOpenAIInstance.models.list).toHaveBeenCalled();
    });

    it('should return false when API fails', async () => {
      const { default: OpenAI } = await import('openai');
      const mockOpenAIInstance = new (OpenAI as any)();
      mockOpenAIInstance.models.list.mockRejectedValue(new Error('API error'));

      const result = await checkDeepSeekHealth();
      expect(result).toBe(false);
    });
  });

  describe('Image analysis', () => {
    it('should analyze image with DeepSeek API', async () => {
      const mockResponse = {
        description: 'Moderní obývací pokoj s velkým oknem',
        categories: ['LIVING_ROOM'],
        tags: ['modern', 'bright', 'spacious'],
        saliencyScore: 0.85,
        suggestedHeadline: 'Moderní obývací pokoj',
        suggestedDescription: 'Prostorný obývací pokoj s dostatkem světla',
      };

      const { default: OpenAI } = await import('openai');
      const mockOpenAIInstance = new (OpenAI as any)();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockResponse),
          },
        }],
      });

      const result = await analyzeImageWithDeepSeek('https://example.com/image.jpg', 'Living room');
      
      expect(result).toEqual(mockResponse);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'deepseek-chat',
        messages: expect.any(Array),
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });
    });

    it('should return fallback when API fails', async () => {
      const { default: OpenAI } = await import('openai');
      const mockOpenAIInstance = new (OpenAI as any)();
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(new Error('API error'));

      const result = await analyzeImageWithDeepSeek('https://example.com/image.jpg');
      
      expect(result.description).toContain('Obrázek nemovitosti na URL:');
      expect(result.categories).toBeDefined();
      expect(result.tags).toEqual(['modern', 'bright', 'spacious']);
      expect(result.saliencyScore).toBeGreaterThanOrEqual(0.7);
      expect(result.saliencyScore).toBeLessThanOrEqual(1.0);
    });
  });

  describe('Content generation', () => {
    it('should generate content with DeepSeek API', async () => {
      const mockImageAnalyses: DeepSeekImageAnalysis[] = [
        {
          description: 'Moderní obývací pokoj',
          categories: ['LIVING_ROOM'],
          tags: ['modern', 'bright'],
          saliencyScore: 0.8,
          suggestedHeadline: 'Moderní obývací pokoj',
          suggestedDescription: 'Prostorný pokoj',
        },
      ];

      const mockResponse: DeepSeekContentGeneration = {
        headline: 'Moderní byt v centru',
        shortDesc: 'Skvělý byt pro mladé páry',
        longDesc: 'Tento moderní byt nabízí vše, co potřebujete pro pohodlné bydlení.',
        bulletPoints: ['Moderní vybavení', 'Dobrá poloha', 'Klidná lokalita'],
        seoTitle: 'Moderní byt k prodeji v Brně',
        seoDescription: 'Prodej moderního bytu v centru Brna.',
        priceSuggestion: 8500000,
        priceReasoning: 'Cena odpovídá tržní hodnotě.',
        targetAudience: 'Mladé páry',
        recommendations: ['Zveřejnit na Sreality'],
        instagramCaption: '#realestate #brno',
        fbPost: 'Nový byt na prodej!',
        bestTimeToPost: 'Pátek odpoledne',
      };

      const { default: OpenAI } = await import('openai');
      const mockOpenAIInstance = new (OpenAI as any)();
      mockOpenAIInstance.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify(mockResponse),
          },
        }],
      });

      const propertyDetails = {
        title: 'Moderní byt Brno',
        address: 'Brno, Česká',
        type: 'Byt',
        price: 8000000,
        area: 65,
        rooms: 3,
      };

      const result = await generateContentWithDeepSeek(mockImageAnalyses, propertyDetails);
      
      expect(result).toEqual(mockResponse);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: 'deepseek-chat',
        messages: expect.any(Array),
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });
    });

    it('should return fallback when content generation fails', async () => {
      const mockImageAnalyses: DeepSeekImageAnalysis[] = [
        {
          description: 'Test image',
          categories: ['LIVING_ROOM'],
          tags: ['test'],
          saliencyScore: 0.5,
        },
      ];

      const { default: OpenAI } = await import('openai');
      const mockOpenAIInstance = new (OpenAI as any)();
      mockOpenAIInstance.chat.completions.create.mockRejectedValue(new Error('API error'));

      const propertyDetails = {
        title: 'Test Property',
        price: 1000000,
      };

      const result = await generateContentWithDeepSeek(mockImageAnalyses, propertyDetails);
      
      expect(result.headline).toContain('Moderní nemovitost');
      expect(result.shortDesc).toBeDefined();
      expect(result.longDesc).toBeDefined();
      expect(result.bulletPoints).toHaveLength(3);
      expect(result.priceSuggestion).toBeGreaterThan(1000000);
    });
  });
});