import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/infrastructure/http/middlewares/auth.middleware';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

vi.mock('../../src/infrastructure/services/jwt-verify.service', () => ({
  verifyAccessToken: vi.fn(),
}));
import { verifyAccessToken } from '../../src/infrastructure/services/jwt-verify.service';
const mockVerify = vi.mocked(verifyAccessToken);

function mockReq(auth?: string): Request {
  return { headers: { authorization: auth } } as unknown as Request;
}
const res = {} as Response;
const next = vi.fn() as NextFunction;

describe('authMiddleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should throw when no header', () => {
    expect(() => authMiddleware(mockReq(), res, next)).toThrow(AppError);
  });
  it('should throw when malformed', () => {
    expect(() => authMiddleware(mockReq('Token x'), res, next)).toThrow(AppError);
  });
  it('should throw when too many parts', () => {
    expect(() => authMiddleware(mockReq('Bearer a b'), res, next)).toThrow(AppError);
  });
  it('should set user and call next on valid token', () => {
    const payload = { userId: 'u-1', email: 'a@b.com', role: 'admin' };
    mockVerify.mockReturnValue(payload as any);
    const req = mockReq('Bearer valid');
    authMiddleware(req, res, next);
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });
  it('should throw TOKEN_EXPIRED', () => {
    mockVerify.mockImplementation(() => { throw new Error('jwt expired'); });
    try { authMiddleware(mockReq('Bearer x'), res, next); } catch (e) {
      expect((e as AppError).code).toBe('TOKEN_EXPIRED');
    }
  });
  it('should throw on bad signature', () => {
    mockVerify.mockImplementation(() => { throw new Error('invalid signature'); });
    try { authMiddleware(mockReq('Bearer x'), res, next); } catch (e) {
      expect((e as AppError).message).toContain('assinatura');
    }
  });
  it('should throw generic on unknown error', () => {
    mockVerify.mockImplementation(() => { throw new Error('other'); });
    try { authMiddleware(mockReq('Bearer x'), res, next); } catch (e) {
      expect((e as AppError).message).toBe('Token inválido');
    }
  });
  it('should handle non-Error throw', () => {
    mockVerify.mockImplementation(() => { throw 'string'; });
    try { authMiddleware(mockReq('Bearer x'), res, next); } catch (e) {
      expect(e).toBeInstanceOf(AppError);
    }
  });
});