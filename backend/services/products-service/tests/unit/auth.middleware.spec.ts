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
  return {
    headers: {
      authorization: authHeader,
    },
  } as unknown as Request;
}

const mockRes = {} as Response;
const mockNext = vi.fn() as NextFunction;

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw unauthorized when no authorization header', () => {
    const req = createMockReq(undefined);

    expect(() => authMiddleware(req, mockRes, mockNext)).toThrow(AppError);
    try {
      authMiddleware(req, mockRes, mockNext);
    } catch (error) {
      expect((error as AppError).statusCode).toBe(401);
      expect((error as AppError).code).toBe('INVALID_TOKEN');
    }
  });

  it('should throw unauthorized when token is malformed (no Bearer)', () => {
    const req = createMockReq('Token abc123');

    expect(() => authMiddleware(req, mockRes, mockNext)).toThrow(AppError);
  });

  it('should throw unauthorized when token has too many parts', () => {
    const req = createMockReq('Bearer token extra');

    expect(() => authMiddleware(req, mockRes, mockNext)).toThrow(AppError);
  });

  it('should call next and set user on valid token', () => {
    const payload = { userId: 'user-1', email: 'admin@fastmeals.com', role: 'admin' };
    mockVerify.mockReturnValue(payload as any);

    const req = createMockReq('Bearer valid-token');

    authMiddleware(req, mockRes, mockNext);

    expect(mockVerify).toHaveBeenCalledWith('valid-token');
    expect(req.user).toEqual(payload);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw TOKEN_EXPIRED when token is expired', () => {
    mockVerify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const req = createMockReq('Bearer expired-token');

    try {
      authMiddleware(req, mockRes, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('TOKEN_EXPIRED');
    }
  });

  it('should throw INVALID_TOKEN when signature is invalid', () => {
    mockVerify.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const req = createMockReq('Bearer bad-signature-token');

    try {
      authMiddleware(req, mockRes, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('INVALID_TOKEN');
      expect((error as AppError).message).toContain('assinatura');
    }
  });

  it('should throw INVALID_TOKEN when issuer is incorrect', () => {
    mockVerify.mockImplementation(() => {
      throw new Error('jwt issuer invalid');
    });

    const req = createMockReq('Bearer bad-issuer-token');

    try {
      authMiddleware(req, mockRes, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).message).toContain('issuer');
    }
  });

  it('should throw generic INVALID_TOKEN on unknown error', () => {
    mockVerify.mockImplementation(() => {
      throw new Error('something else went wrong');
    });

    const req = createMockReq('Bearer unknown-error-token');

    try {
      authMiddleware(req, mockRes, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('INVALID_TOKEN');
      expect((error as AppError).message).toBe('Token inválido');
    }
  });

  it('should throw generic INVALID_TOKEN on non-Error throw', () => {
    mockVerify.mockImplementation(() => {
      throw 'string error';
    });

    const req = createMockReq('Bearer non-error-token');

    try {
      authMiddleware(req, mockRes, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('INVALID_TOKEN');
    }
  });
});