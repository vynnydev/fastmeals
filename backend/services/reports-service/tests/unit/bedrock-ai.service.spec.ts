import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BedrockAIService } from '../../src/infrastructure/services/bedrock-ai.service';

const mockSend = vi.fn();

vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn().mockImplementation(() => ({ send: mockSend })),
  InvokeModelCommand: vi.fn().mockImplementation((params) => ({ ...params, _type: 'invoke' })),
  ConverseCommand: vi.fn().mockImplementation((params) => ({ ...params, _type: 'converse' })),
}));

const sampleInput = {
  period: { startDate: '2026-01-01', endDate: '2026-01-31' },
  revenue: { totalRevenue: 5000, totalOrders: 100, averageOrderValue: 50 },
  ordersByStatus: [
    { status: 'delivered', count: 80 },
    { status: 'cancelled', count: 5 },
  ],
  topProducts: [
    { productName: 'X-Burger', totalQuantity: 50, totalRevenue: 1500 },
  ],
  avgDeliveryTime: { averageMinutes: 35, fastestMinutes: 15, slowestMinutes: 60 },
};

describe('BedrockAIService', () => {
  let service: BedrockAIService;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BEDROCK_MODEL_ID = 'anthropic.claude-haiku-4-5-20251001';
    service = new BedrockAIService();
  });

  describe('generateInsights - Anthropic model', () => {
    it('should invoke Anthropic API and parse JSON response', async () => {
      const aiResponse = JSON.stringify({
        summary: 'Great month',
        recommendations: ['Hire more drivers'],
        highlights: ['Revenue up 20%'],
      });

      mockSend.mockResolvedValue({
        body: new TextEncoder().encode(JSON.stringify({ content: [{ text: aiResponse }] })),
      });

      const result = await service.generateInsights(sampleInput);

      expect(result.summary).toBe('Great month');
      expect(result.recommendations).toEqual(['Hire more drivers']);
      expect(result.highlights).toEqual(['Revenue up 20%']);
      expect(result.model).toBe('anthropic.claude-haiku-4-5-20251001');
      expect(result.generatedAt).toBeDefined();
    });
  });

  describe('generateInsights - fallback', () => {
    it('should return fallback insights on API error', async () => {
      mockSend.mockRejectedValue(new Error('Bedrock unavailable'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.generateInsights(sampleInput);

      expect(result.model).toBe('fallback-local');
      expect(result.summary).toContain('R$ 5000.00');
      expect(result.highlights.length).toBeGreaterThan(0);
    });

    it('should include high delivery time recommendation', async () => {
      mockSend.mockRejectedValue(new Error('fail'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const highDeliveryInput = {
        ...sampleInput,
        avgDeliveryTime: { averageMinutes: 50, fastestMinutes: 30, slowestMinutes: 90 },
      };

      const result = await service.generateInsights(highDeliveryInput);

      expect(result.recommendations.some((r) => r.includes('45 minutos'))).toBe(true);
    });

    it('should include cancelled orders recommendation', async () => {
      mockSend.mockRejectedValue(new Error('fail'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.generateInsights(sampleInput);

      expect(result.recommendations.some((r) => r.includes('cancelados'))).toBe(true);
    });

    it('should include top product in highlights', async () => {
      mockSend.mockRejectedValue(new Error('fail'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await service.generateInsights(sampleInput);

      expect(result.highlights.some((h) => h.includes('X-Burger'))).toBe(true);
    });

    it('should handle zero orders gracefully', async () => {
      mockSend.mockRejectedValue(new Error('fail'));
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const emptyInput = {
        ...sampleInput,
        revenue: { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 },
        topProducts: [],
        ordersByStatus: [],
      };

      const result = await service.generateInsights(emptyInput);

      expect(result.model).toBe('fallback-local');
      expect(result.summary).toContain('R$ 0.00');
    });
  });
});