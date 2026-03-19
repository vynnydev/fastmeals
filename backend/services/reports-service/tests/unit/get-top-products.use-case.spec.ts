import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetTopProductsUseCase } from '../../src/application/use-cases/get-top-products.use-case';
import { IReportRepository } from '../../src/domain/repositories/report-repository.interface';

describe('GetTopProductsUseCase', () => {
  let useCase: GetTopProductsUseCase;
  let mockRepository: IReportRepository;

  beforeEach(() => {
    mockRepository = {
      getRevenue: vi.fn(),
      getOrdersByStatus: vi.fn(),
      getTopProducts: vi.fn().mockResolvedValue({
        data: [
          { productId: 'p1', productName: 'X-Burger', totalQuantity: 156, totalRevenue: 5134.40 },
          { productId: 'p2', productName: 'Suco de Laranja', totalQuantity: 98, totalRevenue: 1225.00 },
        ],
      }),
      getAverageDeliveryTime: vi.fn(),
    };

    useCase = new GetTopProductsUseCase(mockRepository);
  });

  it('should return top products', async () => {
    const result = await useCase.execute({});

    expect(result.data).toHaveLength(2);
    expect(result.data[0].productName).toBe('X-Burger');
    expect(result.data[0].totalQuantity).toBe(156);
  });

  it('should default limit to 10', async () => {
    await useCase.execute({});

    expect(mockRepository.getTopProducts).toHaveBeenCalledWith(
      undefined, undefined, 10,
    );
  });

  it('should pass custom limit', async () => {
    await useCase.execute({ limit: 5 });

    expect(mockRepository.getTopProducts).toHaveBeenCalledWith(
      undefined, undefined, 5,
    );
  });

  it('should pass date range when provided', async () => {
    await useCase.execute({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });

    const [startDate, endDate] = vi.mocked(mockRepository.getTopProducts).mock.calls[0];
    expect(startDate).toBeInstanceOf(Date);
    expect(endDate).toBeInstanceOf(Date);
  });
});