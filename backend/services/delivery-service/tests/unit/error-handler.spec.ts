import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { AppError } from '../../src/infrastructure/http/errors/app-error';
import { ZodError, ZodIssue } from 'zod';

function createMockRes(): Response {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
}

const mockReq = {} as Request;
const mockNext = vi.fn() as NextFunction;

describe('errorHandler', () => {
  it('should handle AppError', () => {
    const error = AppError.notFound('NOT_FOUND', 'Entregador não encontrado');
    const res = createMockRes();

    errorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'NOT_FOUND', message: 'Entregador não encontrado' },
    });
  });

  it('should handle ZodError', () => {
    const zodIssues: ZodIssue[] = [
      {
        code: 'too_small',
        minimum: 1,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Nome é obrigatório',
        path: ['name'],
      },
    ];
    const res = createMockRes();

    errorHandler(new ZodError(zodIssues), mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: [{ field: 'name', message: 'Nome é obrigatório' }],
      },
    });
  });

  it('should handle unknown error with 500', () => {
    const res = createMockRes();
    vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(new Error('boom'), mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' },
    });
  });
});