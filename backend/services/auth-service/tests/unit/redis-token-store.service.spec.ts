import { describe, it, expect, vi } from 'vitest';

const mockSet = vi.fn().mockResolvedValue('OK');
const mockGet = vi.fn().mockResolvedValue(null);
const mockDel = vi.fn().mockResolvedValue(1);
const mockQuit = vi.fn().mockResolvedValue('OK');
const mockOn = vi.fn();

vi.mock('ioredis', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      set: mockSet,
      get: mockGet,
      del: mockDel,
      quit: mockQuit,
      on: mockOn,
    })),
    __esModule: true,
  };
});

import { RedisTokenStoreService } from '../../src/infrastructure/services/redis-token-store.service';

const tokenStore = new RedisTokenStoreService('redis://localhost:6379');

describe('RedisTokenStoreService', () => {
  describe('constructor', () => {
    it('should register error and connect event listeners', () => {
      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('connect', expect.any(Function));
    });
  });

  describe('storeRefreshToken', () => {
    it('should store a refresh token with TTL', async () => {
      await tokenStore.storeRefreshToken('user-123', 'token-abc', 604800);

      expect(mockSet).toHaveBeenCalledWith(
        'auth:refresh_token:user-123',
        'token-abc',
        'EX',
        604800,
      );
    });

    it('should use correct key prefix', async () => {
      await tokenStore.storeRefreshToken('user-456', 'token-xyz', 3600);

      expect(mockSet).toHaveBeenCalledWith(
        'auth:refresh_token:user-456',
        'token-xyz',
        'EX',
        3600,
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should return stored token', async () => {
      mockGet.mockResolvedValueOnce('stored-token');

      const result = await tokenStore.getRefreshToken('user-123');

      expect(result).toBe('stored-token');
      expect(mockGet).toHaveBeenCalledWith('auth:refresh_token:user-123');
    });

    it('should return null for non-existent token', async () => {
      mockGet.mockResolvedValueOnce(null);

      const result = await tokenStore.getRefreshToken('user-nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('revokeRefreshToken', () => {
    it('should delete the token from redis', async () => {
      await tokenStore.revokeRefreshToken('user-123');

      expect(mockDel).toHaveBeenCalledWith('auth:refresh_token:user-123');
    });
  });

  describe('disconnect', () => {
    it('should close redis connection', async () => {
      await tokenStore.disconnect();

      expect(mockQuit).toHaveBeenCalled();
    });
  });
});