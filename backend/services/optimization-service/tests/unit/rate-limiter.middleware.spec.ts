import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { rateLimiter } from '../../src/infrastructure/http/middlewares/rate-limiter.middleware';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

function mockReq(ip: string): Request {
  return { ip, socket: { remoteAddress: ip } } as unknown as Request;
}
function mockRes(): Response {
  return { setHeader: vi.fn() } as unknown as Response;
}

describe('rateLimiter', () => {
  let mw: (req: Request, res: Response, next: NextFunction) => void;
  let next: NextFunction;

  beforeEach(() => { mw = rateLimiter(60000, 3); next = vi.fn(); });

  it('should allow first request and set headers', () => {
    const res = mockRes();
    mw(mockReq('10.3.0.1'), res, next);
    expect(next).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 3);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 2);
  });

  it('should decrement remaining', () => {
    const req = mockReq('10.3.0.2'); const res = mockRes();
    mw(req, res, next); mw(req, res, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 1);
  });

  it('should allow at limit', () => {
    const req = mockReq('10.3.0.3'); const res = mockRes();
    mw(req, res, next); mw(req, res, next); mw(req, res, next);
    expect(next).toHaveBeenCalledTimes(3);
  });

  it('should throw when exceeding', () => {
    const req = mockReq('10.3.0.4'); const res = mockRes();
    mw(req, res, next); mw(req, res, next); mw(req, res, next);
    expect(() => mw(req, res, next)).toThrow(AppError);
  });

  it('should use socket fallback', () => {
    const req = { ip: undefined, socket: { remoteAddress: '1.2.3.4' } } as unknown as Request;
    mw(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('should reset after window', () => {
    const req = mockReq('10.3.0.5'); const res = mockRes();
    const short = rateLimiter(1, 1);
    short(req, res, next);
    return new Promise<void>((r) => {
      setTimeout(() => { short(req, res, next); expect(next).toHaveBeenCalledTimes(2); r(); }, 10);
    });
  });
});