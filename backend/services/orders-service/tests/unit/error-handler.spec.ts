import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { AppError } from '../../src/infrastructure/http/errors/app-error';
import { ZodError, ZodIssue } from 'zod';

function createMockRes(): Response {
  return { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
}

describe('errorHandler', () => {
  const req = {} as Request;
  const next = vi.fn() as NextFunction;

  it('should handle AppError', () => {
    const res = createMockRes();
    errorHandler(AppError.notFound('NF', 'Pedido não encontrado'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should handle ZodError', () => {
    const issues: ZodIssue[] = [{
      code: 'too_small', minimum: 1, type: 'string', inclusive: true, exact: false,
      message: 'Obrigatório', path: ['customerName'],
    }];
    const res = createMockRes();
    errorHandler(new ZodError(issues), req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should handle unknown error with 500', () => {
    const res = createMockRes();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    errorHandler(new Error('boom'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});