import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrdersServiceClient } from '../../src/infrastructure/clients/orders-service.client';
import axios from 'axios';

vi.mock('axios', () => {
  const mockInstance = { get: vi.fn() };
  return { default: { create: vi.fn(() => mockInstance) } };
});

describe('OrdersServiceClient', () => {
  let client: OrdersServiceClient;
  let mockHttp: any;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new OrdersServiceClient();
    mockHttp = (axios.create as any)();
  });

  it('should return ready orders mapped correctly', async () => {
    mockHttp.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 'o-1',
            customerName: 'João',
            deliveryAddress: 'Rua X',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      },
    });

    const result = await client.getReadyOrders('token');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'o-1',
      customerName: 'João',
      deliveryAddress: 'Rua X',
      latitude: -23.55,
      longitude: -46.63,
    });
  });

  it('should return empty array when no data', async () => {
    mockHttp.get.mockResolvedValue({ data: {} });

    const result = await client.getReadyOrders('token');

    expect(result).toEqual([]);
  });

  it('should return empty array on error', async () => {
    mockHttp.get.mockRejectedValue(new Error('timeout'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await client.getReadyOrders('token');

    expect(result).toEqual([]);
  });

  it('should pass correct params and headers', async () => {
    mockHttp.get.mockResolvedValue({ data: { data: [] } });

    await client.getReadyOrders('my-token');

    expect(mockHttp.get).toHaveBeenCalledWith('/api/orders', {
      params: { status: 'ready', limit: 100 },
      headers: { Authorization: 'Bearer my-token' },
    });
  });
});