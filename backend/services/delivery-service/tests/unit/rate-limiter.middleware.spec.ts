import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../../src/infrastructure/http/middlewares/rate-limiter.middleware';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

function createMockReq(ip: string = '127.0.0.1'): Request {
  return { ip, socket: { remoteAddress: ip } } as unknown as Request;
}

function createMockRes(): Response {
  return { setHeader: vi.fn() } as unknown as Response;
}

describe('rateLimiter', () => {
  let middleware: (req: Request, res: Response, next: NextFunction) => void;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = rateLimiter(60000, 3);
    mockNext = vi.fn();
  });

  it('should allow first request and set headers', () => {
    const req = createMockReq('10.1.0.1');
    const res = createMockRes();

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 3);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 2);
  });

  it('should decrement remaining on subsequent requests', () => {
    const req = createMockReq('10.1.0.2');
    const res = createMockRes();

    middleware(req, res, mockNext);
    middleware(req, res, mockNext);

    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1);
  });

  it('should allow request at the limit', () => {
    const req = createMockReq('10.1.0.3');
    const res = createMockRes();

    middleware(req, res, mockNext);
    middleware(req, res, mockNext);
    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(3);
  });

  it('should throw tooManyRequests when exceeding limit', () => {
    const req = createMockReq('10.1.0.4');
    const res = createMockRes();

    middleware(req, res, mockNext);
    middleware(req, res, mockNext);
    middleware(req, res, mockNext);

    expect(() => middleware(req, res, mockNext)).toThrow(AppError);
  });

  it('should set X-RateLimit-Reset as ISO string', () => {
    const req = createMockReq('10.1.0.5');
    const res = createMockRes();

    middleware(req, res, mockNext);

    const resetCall = (res.setHeader as any).mock.calls.find(
      (c: any[]) => c[0] === 'X-RateLimit-Reset',
    );
    expect(() => new Date(resetCall[1])).not.toThrow();
  });

  it('should use socket.remoteAddress as fallback', () => {
    const req = { ip: undefined, socket: { remoteAddress: '192.168.1.1' } } as unknown as Request;
    const res = createMockRes();

    middleware(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should reset counter after window expires', () => {
    const req = createMockReq('10.1.0.6');
    const res = createMockRes();
    const shortMiddleware = rateLimiter(1, 1);

    shortMiddleware(req, res, mockNext);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        shortMiddleware(req, res, mockNext);
        expect(mockNext).toHaveBeenCalledTimes(2);
        resolve();
      }, 10);
    });
  });
});