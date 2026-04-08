import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAvgDeliveryTimeUseCase } from '../../src/application/use-cases/get-avg-delivery-time.use-case';

const mockRepo = {
  getRevenue: vi.fn(),
  getOrdersByStatus: vi.fn(),
  getTopProducts: vi.fn(),
  getAverageDeliveryTime: vi.fn(),
};

const mockResult = {
  averageMinutes: 30,
  fastestMinutes: 15,
  slowestMinutes: 60,
  totalDelivered: 10,
  byVehicleType: [],
};

describe('GetAvgDeliveryTimeUseCase', () => {
  let useCase: GetAvgDeliveryTimeUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetAvgDeliveryTimeUseCase(mockRepo);
  });

  it('should call repository without dates when not provided', async () => {
    mockRepo.getAverageDeliveryTime.mockResolvedValue(mockResult);

    const result = await useCase.execute({});

    expect(result).toEqual(mockResult);
    expect(mockRepo.getAverageDeliveryTime).toHaveBeenCalledWith(undefined, undefined);
  });

  it('should pass startDate and endDate with 23:59:59', async () => {
    mockRepo.getAverageDeliveryTime.mockResolvedValue(mockResult);

    await useCase.execute({ startDate: '2026-01-01', endDate: '2026-01-31' });

    const [startDate, endDate] = mockRepo.getAverageDeliveryTime.mock.calls[0];
    expect(startDate).toEqual(new Date('2026-01-01'));
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
  });

  it('should handle only startDate', async () => {
    mockRepo.getAverageDeliveryTime.mockResolvedValue(mockResult);

    await useCase.execute({ startDate: '2026-01-01' });

    const [startDate, endDate] = mockRepo.getAverageDeliveryTime.mock.calls[0];
    expect(startDate).toEqual(new Date('2026-01-01'));
    expect(endDate).toBeUndefined();
  });
});