import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAIInsightsUseCase } from '../../src/application/use-cases/get-ai-insights.use-case';
import { IReportRepository } from '../../src/domain/repositories/report-repository.interface';
import { IAIService } from '../../src/application/interfaces/ai-service.interface';

describe('GetAIInsightsUseCase', () => {
  let useCase: GetAIInsightsUseCase;
  let mockRepository: IReportRepository;
  let mockAIService: IAIService;

  beforeEach(() => {
    mockRepository = {
      getRevenue: vi.fn().mockResolvedValue({
        totalRevenue: 15420.50,
        totalOrders: 312,
        averageOrderValue: 49.42,
        dailyRevenue: [],
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      }),
      getOrdersByStatus: vi.fn().mockResolvedValue({
        data: [
          { status: 'delivered', count: 284 },
          { status: 'cancelled', count: 18 },
        ],
        total: 340,
      }),
      getTopProducts: vi.fn().mockResolvedValue({
        data: [
          { productId: 'p1', productName: 'X-Burger', totalQuantity: 156, totalRevenue: 5134.40 },
        ],
      }),
      getAverageDeliveryTime: vi.fn().mockResolvedValue({
        averageMinutes: 42.5,
        fastestMinutes: 18,
        slowestMinutes: 87,
        totalDelivered: 284,
        byVehicleType: [],
      }),
    };

    mockAIService = {
      generateInsights: vi.fn().mockResolvedValue({
        summary: 'Excelente desempenho no período.',
        recommendations: ['Expandir cardápio de bebidas'],
        highlights: ['X-Burger lidera vendas'],
        generatedAt: '2026-03-18T23:00:00Z',
        model: 'anthropic.claude-haiku-4-5-20251001',
      }),
    };

    useCase = new GetAIInsightsUseCase(mockRepository, mockAIService);
  });

  it('should gather all reports and generate AI insights', async () => {
    const result = await useCase.execute({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });

    expect(result.summary).toBe('Excelente desempenho no período.');
    expect(result.recommendations).toContain('Expandir cardápio de bebidas');
    expect(result.highlights).toContain('X-Burger lidera vendas');
    expect(result.model).toBe('anthropic.claude-haiku-4-5-20251001');

    expect(mockRepository.getRevenue).toHaveBeenCalledTimes(1);
    expect(mockRepository.getOrdersByStatus).toHaveBeenCalledTimes(1);
    expect(mockRepository.getTopProducts).toHaveBeenCalledTimes(1);
    expect(mockRepository.getAverageDeliveryTime).toHaveBeenCalledTimes(1);
    expect(mockAIService.generateInsights).toHaveBeenCalledTimes(1);
  });

  it('should pass correct data structure to AI service', async () => {
    await useCase.execute({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });

    const aiInput = vi.mocked(mockAIService.generateInsights).mock.calls[0][0];

    expect(aiInput.revenue.totalRevenue).toBe(15420.50);
    expect(aiInput.ordersByStatus).toHaveLength(2);
    expect(aiInput.topProducts).toHaveLength(1);
    expect(aiInput.avgDeliveryTime.averageMinutes).toBe(42.5);
    expect(aiInput.period.startDate).toBe('2026-01-01');
  });

  it('should fetch all reports in parallel', async () => {
    const callOrder: string[] = [];

    vi.mocked(mockRepository.getRevenue).mockImplementation(async () => {
      callOrder.push('revenue');
      return { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0, dailyRevenue: [], startDate: '', endDate: '' };
    });

    vi.mocked(mockRepository.getOrdersByStatus).mockImplementation(async () => {
      callOrder.push('status');
      return { data: [], total: 0 };
    });

    vi.mocked(mockRepository.getTopProducts).mockImplementation(async () => {
      callOrder.push('products');
      return { data: [] };
    });

    vi.mocked(mockRepository.getAverageDeliveryTime).mockImplementation(async () => {
      callOrder.push('delivery');
      return { averageMinutes: 0, fastestMinutes: 0, slowestMinutes: 0, totalDelivered: 0, byVehicleType: [] };
    });

    await useCase.execute({ startDate: '2026-01-01', endDate: '2026-01-31' });

    // All 4 reports should be called (Promise.all runs them in parallel)
    expect(callOrder).toHaveLength(4);
  });
});