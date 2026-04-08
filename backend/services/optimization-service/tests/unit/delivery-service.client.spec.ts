import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeliveryServiceClient } from '../../src/infrastructure/clients/delivery-service.client';
import axios from 'axios';

vi.mock('axios', () => {
  const mockInstance = { get: vi.fn() };
  return { default: { create: vi.fn(() => mockInstance) } };
});

describe('DeliveryServiceClient', () => {
  let client: DeliveryServiceClient;
  let mockHttp: any;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DeliveryServiceClient();
    mockHttp = (axios.create as any)();
  });

  it('should return available delivery persons with coordinates', async () => {
    mockHttp.get.mockResolvedValue({
      data: {
        data: [
          { id: 'dp-1', name: 'João', currentLatitude: -23.55, currentLongitude: -46.63 },
          { id: 'dp-2', name: 'Maria', currentLatitude: null, currentLongitude: null },
        ],
      },
    });

    const result = await client.getAvailableDeliveryPersons('token');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      id: 'dp-1',
      name: 'João',
      currentLatitude: -23.55,
      currentLongitude: -46.63,
    });
  });

  it('should return empty array when no data', async () => {
    mockHttp.get.mockResolvedValue({ data: {} });

    const result = await client.getAvailableDeliveryPersons('token');

    expect(result).toEqual([]);
  });

  it('should return empty array on error', async () => {
    mockHttp.get.mockRejectedValue(new Error('network error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await client.getAvailableDeliveryPersons('token');

    expect(result).toEqual([]);
  });

  it('should pass correct headers and params', async () => {
    mockHttp.get.mockResolvedValue({ data: { data: [] } });

    await client.getAvailableDeliveryPersons('my-token');

    expect(mockHttp.get).toHaveBeenCalledWith('/api/delivery-persons', {
      params: { available: 'true' },
      headers: { Authorization: 'Bearer my-token' },
    });
  });
});