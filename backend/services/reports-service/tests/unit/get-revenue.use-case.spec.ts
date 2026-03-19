import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetRevenueUseCase } from '../../src/application/use-cases/get-revenue.use-case';
import { IReportRepository } from '../../src/domain/repositories/report-repository.interface';

describe('GetRevenueUseCase', () => {
  let useCase: GetRevenueUseCase;
  let mockRepository: IReportRepository;

  beforeEach(() => {
    mockRepository = {
      getRevenue: vi.fn().mockResolvedValue({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        totalRevenue: 15420.50,
        totalOrders: 312,
        averageOrderValue: 49.42,
        dailyRevenue: [
          { date: '2026-01-01', revenue: 520.00, orders: 12 },
        ],
      }),
      getOrdersByStatus: vi.fn(),
      getTopProducts: vi.fn(),
      getAverageDeliveryTime: vi.fn(),
    };

    useCase = new GetRevenueUseCase(mockRepository);
  });

  it('should return revenue report for a period', async () => {
    const result = await useCase.execute({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });

    expect(result.totalRevenue).toBe(15420.50);
    expect(result.totalOrders).toBe(312);
    expect(result.averageOrderValue).toBe(49.42);
    expect(result.dailyRevenue).toHaveLength(1);
    expect(mockRepository.getRevenue).toHaveBeenCalledTimes(1);
  });

  it('should pass correct date range to repository', async () => {
    await useCase.execute({
      startDate: '2026-03-01',
      endDate: '2026-03-18',
    });

    const [startDate, endDate] = vi.mocked(mockRepository.getRevenue).mock.calls[0];
    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
  });
});