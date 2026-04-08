import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductServiceClient } from '../../src/infrastructure/clients/product-service.client';
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

describe('ProductServiceClient', () => {
  let client: ProductServiceClient;
  let mockHttp: any;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new ProductServiceClient();
    mockHttp = (axios.create as any)();
  });

  describe('getProductById', () => {
    it('should return product info on success', async () => {
      mockHttp.get.mockResolvedValue({
        data: { id: 'prod-001', name: 'X-Burger', price: 29.9, isAvailable: true },
      });

      const result = await client.getProductById('prod-001', 'token');

      expect(result).toEqual({
        id: 'prod-001',
        name: 'X-Burger',
        price: 29.9,
        isAvailable: true,
      });
    });

    it('should return null on 404', async () => {
      const axiosError = { isAxiosError: true, response: { status: 404 } };
      mockHttp.get.mockRejectedValue(axiosError);
      (axios.isAxiosError as any).mockReturnValue(true);

      const result = await client.getProductById('nonexistent', 'token');

      expect(result).toBeNull();
    });

    it('should throw on other errors', async () => {
      mockHttp.get.mockRejectedValue(new Error('timeout'));
      (axios.isAxiosError as any).mockReturnValue(false);

      await expect(client.getProductById('prod-001', 'token')).rejects.toThrow('timeout');
    });
  });

  describe('getProductsByIds', () => {
    it('should return all found products', async () => {
      mockHttp.get
        .mockResolvedValueOnce({ data: { id: 'p1', name: 'A', price: 10, isAvailable: true } })
        .mockResolvedValueOnce({ data: { id: 'p2', name: 'B', price: 20, isAvailable: true } });

      const result = await client.getProductsByIds(['p1', 'p2'], 'token');

      expect(result).toHaveLength(2);
    });

    it('should skip products that return null (404)', async () => {
      mockHttp.get
        .mockResolvedValueOnce({ data: { id: 'p1', name: 'A', price: 10, isAvailable: true } })
        .mockRejectedValueOnce({ isAxiosError: true, response: { status: 404 } });
      (axios.isAxiosError as any).mockReturnValue(true);

      const result = await client.getProductsByIds(['p1', 'p2'], 'token');

      expect(result).toHaveLength(1);
    });

    it('should skip products that throw errors', async () => {
      mockHttp.get
        .mockResolvedValueOnce({ data: { id: 'p1', name: 'A', price: 10, isAvailable: true } })
        .mockRejectedValueOnce(new Error('network'));
      (axios.isAxiosError as any).mockReturnValue(false);

      const result = await client.getProductsByIds(['p1', 'p2'], 'token');

      expect(result).toHaveLength(1);
    });

    it('should return empty array when all fail', async () => {
      mockHttp.get.mockRejectedValue(new Error('fail'));
      (axios.isAxiosError as any).mockReturnValue(false);

      const result = await client.getProductsByIds(['p1', 'p2'], 'token');

      expect(result).toEqual([]);
    });
  });
});