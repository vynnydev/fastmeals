import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeliveryServiceClient } from '../../src/infrastructure/clients/delivery-service.client';
import axios from 'axios';

vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      isAxiosError: vi.fn((e: any) => e?.isAxiosError === true),
    },
  };
});

describe('DeliveryServiceClient', () => {
  let client: DeliveryServiceClient;
  let mockHttp: any;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DeliveryServiceClient();
    mockHttp = (axios.create as any)();
  });

  describe('getDeliveryPersonById', () => {
    it('should return delivery person info on success', async () => {
      mockHttp.get.mockResolvedValue({
        data: { id: 'dp-001', name: 'Carlos', isActive: true, currentOrderId: null },
      });

      const result = await client.getDeliveryPersonById('dp-001', 'token');

      expect(result).toEqual({
        id: 'dp-001',
        name: 'Carlos',
        isActive: true,
        currentOrderId: null,
      });
    });

    it('should return null on 404', async () => {
      const axiosError = { isAxiosError: true, response: { status: 404 } };
      mockHttp.get.mockRejectedValue(axiosError);
      (axios.isAxiosError as any).mockReturnValue(true);

      const result = await client.getDeliveryPersonById('nonexistent', 'token');

      expect(result).toBeNull();
    });

    it('should throw on other errors', async () => {
      mockHttp.get.mockRejectedValue(new Error('network error'));
      (axios.isAxiosError as any).mockReturnValue(false);

      await expect(client.getDeliveryPersonById('dp-001', 'token')).rejects.toThrow('network error');
    });
  });

  describe('isDeliveryPersonAvailable', () => {
    it('should return true when active and no current order', async () => {
      mockHttp.get.mockResolvedValue({
        data: { id: 'dp-001', name: 'Carlos', isActive: true, currentOrderId: null },
      });

      const result = await client.isDeliveryPersonAvailable('dp-001', 'token');

      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      const axiosError = { isAxiosError: true, response: { status: 404 } };
      mockHttp.get.mockRejectedValue(axiosError);
      (axios.isAxiosError as any).mockReturnValue(true);

      const result = await client.isDeliveryPersonAvailable('nonexistent', 'token');

      expect(result).toBe(false);
    });

    it('should return false when inactive', async () => {
      mockHttp.get.mockResolvedValue({
        data: { id: 'dp-001', name: 'Carlos', isActive: false, currentOrderId: null },
      });

      const result = await client.isDeliveryPersonAvailable('dp-001', 'token');

      expect(result).toBe(false);
    });

    it('should return false when has current order', async () => {
      mockHttp.get.mockResolvedValue({
        data: { id: 'dp-001', name: 'Carlos', isActive: true, currentOrderId: 'order-999' },
      });

      const result = await client.isDeliveryPersonAvailable('dp-001', 'token');

      expect(result).toBe(false);
    });
  });
});