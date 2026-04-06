import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';

// Mock env and JwtService
vi.mock('../../src/infrastructure/config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret-key-for-testing',
    JWT_REFRESH_SECRET: 'test-refresh-secret-key-for-testing',
    JWT_ACCESS_EXPIRATION: '15m',
    JWT_REFRESH_EXPIRATION: '7d',
  },
}));

import { authMiddleware, roleGuard } from '../../src/infrastructure/http/middlewares/auth.middleware';
import { JwtService } from '../../src/infrastructure/services/jwt.service';

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jwtService: JwtService;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {};
    mockNext = vi.fn();
    jwtService = new JwtService();
  });

  describe('authMiddleware', () => {
    it('should throw when no authorization header', () => {
      expect(() =>
        authMiddleware(mockReq as Request, mockRes as Response, mockNext),
      ).toThrow('Token não fornecido');
    });

    it('should throw when token is malformed (no Bearer)', () => {
      mockReq.headers = { authorization: 'InvalidFormat token123' };

      expect(() =>
        authMiddleware(mockReq as Request, mockRes as Response, mockNext),
      ).toThrow('Token mal formado');
    });

    it('should throw when token has wrong number of parts', () => {
      mockReq.headers = { authorization: 'Bearer' };

      expect(() =>
        authMiddleware(mockReq as Request, mockRes as Response, mockNext),
      ).toThrow('Token mal formado');
    });

    it('should throw when token is expired or invalid', () => {
      mockReq.headers = { authorization: 'Bearer invalid-jwt-token' };

      expect(() =>
        authMiddleware(mockReq as Request, mockRes as Response, mockNext),
      ).toThrow('Access token expirado');
    });

    it('should set req.user and call next() with valid token', () => {
      const payload = { userId: 'user-123', email: 'admin@fastmeals.com', role: 'admin' };
      const token = jwtService.generateAccessToken(payload);
      mockReq.headers = { authorization: `Bearer ${token}` };

      authMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.user).toBeDefined();
      expect(mockReq.user?.userId).toBe('user-123');
      expect(mockReq.user?.email).toBe('admin@fastmeals.com');
      expect(mockReq.user?.role).toBe('admin');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('roleGuard', () => {
    it('should throw when req.user is not set', () => {
      const guard = roleGuard('admin');

      expect(() =>
        guard(mockReq as Request, mockRes as Response, mockNext),
      ).toThrow('Token não fornecido');
    });

    it('should throw when user role is not allowed', () => {
      mockReq.user = { userId: 'user-123', email: 'viewer@fastmeals.com', role: 'viewer' };
      const guard = roleGuard('admin');

      expect(() =>
        guard(mockReq as Request, mockRes as Response, mockNext),
      ).toThrow();
    });

    it('should call next() when user role is allowed', () => {
      mockReq.user = { userId: 'user-123', email: 'admin@fastmeals.com', role: 'admin' };
      const guard = roleGuard('admin', 'viewer');

      guard(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      mockReq.user = { userId: 'user-123', email: 'viewer@fastmeals.com', role: 'viewer' };
      const guard = roleGuard('admin', 'viewer');

      guard(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});