import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { AppError } from '../../src/infrastructure/http/errors/app-error';
import { ZodError, ZodIssue } from 'zod';

function createMockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

const mockReq = {} as Request;
const mockNext = vi.fn() as NextFunction;

describe('errorHandler', () => {
  it('should handle AppError with correct status and JSON', () => {
    const error = AppError.unauthorized('INVALID_TOKEN', 'Token inválido');
    const res = createMockRes();

    errorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token inválido',
      },
    });
  });

  it('should handle AppError with details', () => {
    const error = AppError.badRequest('VALIDATION', 'Inválido', [
      { field: 'email', message: 'formato inválido' },
    ]);
    const res = createMockRes();

    errorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION',
        message: 'Inválido',
        details: [{ field: 'email', message: 'formato inválido' }],
      },
    });
  });

  it('should handle ZodError with 400 and formatted details', () => {
    const zodIssues: ZodIssue[] = [
      {
        code: 'too_small',
        minimum: 1,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Email é obrigatório',
        path: ['email'],
      },
      {
        code: 'too_small',
        minimum: 8,
        type: 'string',
        inclusive: true,
        exact: false,
        message: 'Senha deve ter no mínimo 8 caracteres',
        path: ['password'],
      },
    ];
    const error = new ZodError(zodIssues);
    const res = createMockRes();

    errorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: [
          { field: 'email', message: 'Email é obrigatório' },
          { field: 'password', message: 'Senha deve ter no mínimo 8 caracteres' },
        ],
      },
    });
  });

  it('should handle unknown error with 500', () => {
    const error = new Error('Something broke');
    const res = createMockRes();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(error, mockReq, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
    expect(consoleSpy).toHaveBeenCalledWith('Unhandled error:', error);
  });
});