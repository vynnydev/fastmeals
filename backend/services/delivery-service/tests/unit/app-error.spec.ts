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
        { field: 'phone', message: 'formato inválido' },
      ]);
      expect(error.statusCode).toBe(400);
      expect(error.details).toHaveLength(1);
    });

    it('badRequest should default details to empty', () => {
      expect(AppError.badRequest('INVALID', 'Bad').details).toEqual([]);
    });

    it('unauthorized should create 401 error', () => {
      const error = AppError.unauthorized('NO_AUTH', 'Not authenticated');
      expect(error.statusCode).toBe(401);
    });

    it('forbidden should create 403 with default message', () => {
      const error = AppError.forbidden();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBe('Permissão insuficiente para a ação');
    });

    it('forbidden should accept custom message', () => {
      expect(AppError.forbidden('Sem acesso').message).toBe('Sem acesso');
    });

    it('notFound should create 404 error', () => {
      const error = AppError.notFound('NOT_FOUND', 'Entregador não encontrado');
      expect(error.statusCode).toBe(404);
    });

    it('conflict should create 409 error', () => {
      const error = AppError.conflict('IN_USE', 'Entregador em uso');
      expect(error.statusCode).toBe(409);
    });

    it('unprocessable should create 422 error', () => {
      const error = AppError.unprocessable('ERR', 'msg', [{ field: 'x', message: 'y' }]);
      expect(error.statusCode).toBe(422);
      expect(error.details).toHaveLength(1);
    });

    it('unprocessable should default details to empty', () => {
      expect(AppError.unprocessable('ERR', 'msg').details).toEqual([]);
    });

    it('tooManyRequests should create 429 with default message', () => {
      const error = AppError.tooManyRequests();
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Limite de requisições atingido');
    });

    it('tooManyRequests should accept custom message', () => {
      expect(AppError.tooManyRequests('Calma').message).toBe('Calma');
    });

    it('internal should create 500 with default message', () => {
      const error = AppError.internal();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Erro interno do servidor');
    });

    it('internal should accept custom message', () => {
      expect(AppError.internal('Quebrou').message).toBe('Quebrou');
    });
  });

  describe('toJSON', () => {
    it('should return error without details when empty', () => {
      expect(AppError.notFound('NF', 'Não achei').toJSON()).toEqual({
        error: { code: 'NF', message: 'Não achei' },
      });
    });

    it('should include details when present', () => {
      const json = AppError.badRequest('V', 'Inválido', [
        { field: 'name', message: 'obrigatório' },
      ]).toJSON();
      expect(json.error).toHaveProperty('details');
    });
  });
});