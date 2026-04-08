import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { AppError } from '../../src/infrastructure/http/errors/app-error';
import { ZodError, ZodIssue } from 'zod';

function mockRes(): Response {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
}

describe('errorHandler', () => {
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it('should handle AppError', () => {
    const res = mockRes();
    errorHandler(AppError.badRequest('V', 'bad'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle ZodError', () => {
    const issues: ZodIssue[] = [{ code: 'too_small', minimum: 1, type: 'string', inclusive: true, exact: false, message: 'Required', path: ['field'] }];
    const res = mockRes();
    errorHandler(new ZodError(issues), req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle unknown error with 500', () => {
    const res = mockRes();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    errorHandler(new Error('boom'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});