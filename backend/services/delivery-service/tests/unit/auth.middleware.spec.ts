import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/infrastructure/http/middlewares/auth.middleware';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

vi.mock('../../src/infrastructure/services/jwt-verify.service', () => ({
  verifyAccessToken: vi.fn(),
}));

import { verifyAccessToken } from '../../src/infrastructure/services/jwt-verify.service';

const mockVerify = vi.mocked(verifyAccessToken);

function createMockReq(authHeader?: string): Request {
  return { headers: { authorization: authHeader } } as unknown as Request;
}

const mockRes = {} as Response;
const mockNext = vi.fn() as NextFunction;

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw when no authorization header', () => {
    expect(() => authMiddleware(createMockReq(undefined), mockRes, mockNext)).toThrow(AppError);
  });

  it('should throw when token is malformed', () => {
    expect(() => authMiddleware(createMockReq('Token abc'), mockRes, mockNext)).toThrow(AppError);
  });

  it('should throw when too many parts', () => {
    expect(() => authMiddleware(createMockReq('Bearer a b'), mockRes, mockNext)).toThrow(AppError);
  });

  it('should set user and call next on valid token', () => {
    const payload = { userId: 'u-1', email: 'admin@fastmeals.com', role: 'admin' };
    mockVerify.mockReturnValue(payload as any);

    const req = createMockReq('Bearer valid-token');
    authMiddleware(req, mockRes, mockNext);

    expect(req.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw TOKEN_EXPIRED on expired token', () => {
    mockVerify.mockImplementation(() => { throw new Error('jwt expired'); });

    try {
      authMiddleware(createMockReq('Bearer expired'), mockRes, mockNext);
    } catch (error) {
      expect((error as AppError).code).toBe('TOKEN_EXPIRED');
    }
  });

  it('should throw INVALID_TOKEN on bad signature', () => {
    mockVerify.mockImplementation(() => { throw new Error('invalid signature'); });

    try {
      authMiddleware(createMockReq('Bearer bad-sig'), mockRes, mockNext);
    } catch (error) {
      expect((error as AppError).code).toBe('INVALID_TOKEN');
      expect((error as AppError).message).toContain('assinatura');
    }
  });

  it('should throw generic INVALID_TOKEN on unknown error', () => {
    mockVerify.mockImplementation(() => { throw new Error('something else'); });

    try {
      authMiddleware(createMockReq('Bearer unknown'), mockRes, mockNext);
    } catch (error) {
      expect((error as AppError).code).toBe('INVALID_TOKEN');
      expect((error as AppError).message).toBe('Token inválido');
    }
  });

  it('should throw INVALID_TOKEN on non-Error throw', () => {
    mockVerify.mockImplementation(() => { throw 'string error'; });

    try {
      authMiddleware(createMockReq('Bearer non-error'), mockRes, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
    }
  });
});