import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with all properties', () => {
      const error = new AppError(400, 'TEST_CODE', 'Test message', [
        { field: 'name', message: 'required' },
      ]);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST_CODE');
      expect(error.message).toBe('Test message');
      expect(error.details).toEqual([{ field: 'name', message: 'required' }]);
    });

    it('should default details to empty array', () => {
      const error = new AppError(500, 'ERR', 'msg');
      expect(error.details).toEqual([]);
    });

    it('should be instance of Error and AppError', () => {
      const error = new AppError(400, 'ERR', 'msg');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe('static factories', () => {
    it('badRequest should create 400 error', () => {
      const error = AppError.badRequest('INVALID', 'Bad input', [
        { field: 'price', message: 'must be positive' },
      ]);

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('INVALID');
      expect(error.message).toBe('Bad input');
      expect(error.details).toHaveLength(1);
    });

    it('badRequest should default details to empty', () => {
      const error = AppError.badRequest('INVALID', 'Bad');
      expect(error.details).toEqual([]);
    });

    it('unauthorized should create 401 error', () => {
      const error = AppError.unauthorized('NO_AUTH', 'Not authenticated');

      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('NO_AUTH');
      expect(error.message).toBe('Not authenticated');
    });

    it('forbidden should create 403 error with default message', () => {
      const error = AppError.forbidden();

      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Permissão insuficiente para a ação');
    });

    it('forbidden should accept custom message', () => {
      const error = AppError.forbidden('Sem acesso');
      expect(error.message).toBe('Sem acesso');
    });

    it('notFound should create 404 error', () => {
      const error = AppError.notFound('NOT_FOUND', 'Recurso não encontrado');

      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });

    it('conflict should create 409 error', () => {
      const error = AppError.conflict('DUPLICATE', 'Já existe');

      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('DUPLICATE');
    });

    it('unprocessable should create 422 error', () => {
      const error = AppError.unprocessable('UNPROCESSABLE', 'Cannot process', [
        { field: 'category', message: 'invalid' },
      ]);

      expect(error.statusCode).toBe(422);
      expect(error.code).toBe('UNPROCESSABLE');
      expect(error.details).toHaveLength(1);
    });

    it('unprocessable should default details to empty', () => {
      const error = AppError.unprocessable('ERR', 'msg');
      expect(error.details).toEqual([]);
    });

    it('tooManyRequests should create 429 error with default message', () => {
      const error = AppError.tooManyRequests();

      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.message).toBe('Limite de requisições atingido');
    });

    it('tooManyRequests should accept custom message', () => {
      const error = AppError.tooManyRequests('Calma aí');
      expect(error.message).toBe('Calma aí');
    });

    it('internal should create 500 error with default message', () => {
      const error = AppError.internal();

      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.message).toBe('Erro interno do servidor');
    });

    it('internal should accept custom message', () => {
      const error = AppError.internal('Algo deu errado');
      expect(error.message).toBe('Algo deu errado');
    });
  });

  describe('toJSON', () => {
    it('should return error object without details when empty', () => {
      const error = AppError.notFound('NOT_FOUND', 'Não achei');
      const json = error.toJSON();

      expect(json).toEqual({
        error: {
          code: 'NOT_FOUND',
          message: 'Não achei',
        },
      });
    });

    it('should include details when present', () => {
      const error = AppError.badRequest('INVALID', 'Inválido', [
        { field: 'name', message: 'obrigatório' },
        { field: 'price', message: 'deve ser positivo' },
      ]);
      const json = error.toJSON();

      expect(json).toEqual({
        error: {
          code: 'INVALID',
          message: 'Inválido',
          details: [
            { field: 'name', message: 'obrigatório' },
            { field: 'price', message: 'deve ser positivo' },
          ],
        },
      });
    });
  });
});