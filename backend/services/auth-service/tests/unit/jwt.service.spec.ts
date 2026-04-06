import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock env before importing JwtService
vi.mock('../../src/infrastructure/config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret-key-for-testing',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing',
    JWT_ACCESS_EXPIRATION: '15m',
    JWT_REFRESH_EXPIRATION: '7d',
  },
}));

import { JwtService } from '../../src/infrastructure/services/jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  const mockPayload = {
    userId: 'user-123',
    email: 'admin@fastmeals.com',
    role: 'admin',
  };

  beforeEach(() => {
    jwtService = new JwtService();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = jwtService.generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct payload in access token', () => {
      const token = jwtService.generateAccessToken(mockPayload);
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.iss).toBe('fastmeals-auth-service');
      expect(decoded.sub).toBe(mockPayload.userId);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = jwtService.generateRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for access and refresh', () => {
      const accessToken = jwtService.generateAccessToken(mockPayload);
      const refreshToken = jwtService.generateRefreshToken(mockPayload);

      expect(accessToken).not.toBe(refreshToken);
    });

    it('should include correct payload in refresh token', () => {
      const token = jwtService.generateRefreshToken(mockPayload);
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const token = jwtService.generateAccessToken(mockPayload);
      const result = jwtService.verifyAccessToken(token);

      expect(result.userId).toBe(mockPayload.userId);
      expect(result.email).toBe(mockPayload.email);
      expect(result.role).toBe(mockPayload.role);
    });

    it('should throw on invalid access token', () => {
      expect(() => jwtService.verifyAccessToken('invalid-token')).toThrow();
    });

    it('should throw on token signed with wrong secret', () => {
      const fakeToken = jwt.sign(mockPayload, 'wrong-secret');
      expect(() => jwtService.verifyAccessToken(fakeToken)).toThrow();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const token = jwtService.generateRefreshToken(mockPayload);
      const result = jwtService.verifyRefreshToken(token);

      expect(result.userId).toBe(mockPayload.userId);
      expect(result.email).toBe(mockPayload.email);
      expect(result.role).toBe(mockPayload.role);
    });

    it('should throw on invalid refresh token', () => {
      expect(() => jwtService.verifyRefreshToken('invalid-token')).toThrow();
    });

    it('should not verify access token as refresh token', () => {
      const accessToken = jwtService.generateAccessToken(mockPayload);
      expect(() => jwtService.verifyRefreshToken(accessToken)).toThrow();
    });
  });
});