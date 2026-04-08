import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with all properties', () => {
      const error = new AppError(400, 'TEST', 'msg', [{ field: 'x', message: 'y' }]);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('TEST');
      expect(error.message).toBe('msg');
      expect(error.details).toHaveLength(1);
    });

    it('should default details to empty', () => {
      expect(new AppError(500, 'E', 'm').details).toEqual([]);
    });

    it('should be instance of Error and AppError', () => {
      const e = new AppError(400, 'E', 'm');
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(AppError);
    });
  });

  describe('static factories', () => {
    it('badRequest 400', () => {
      const e = AppError.badRequest('V', 'bad', [{ field: 'a', message: 'b' }]);
      expect(e.statusCode).toBe(400);
      expect(e.details).toHaveLength(1);
    });
    it('badRequest defaults empty details', () => {
      expect(AppError.badRequest('V', 'b').details).toEqual([]);
    });
    it('unauthorized 401', () => {
      expect(AppError.unauthorized('U', 'no').statusCode).toBe(401);
    });
    it('forbidden 403 default', () => {
      const e = AppError.forbidden();
      expect(e.statusCode).toBe(403);
      expect(e.message).toBe('Permissão insuficiente para a ação');
    });
    it('forbidden custom msg', () => {
      expect(AppError.forbidden('X').message).toBe('X');
    });
    it('notFound 404', () => {
      expect(AppError.notFound('NF', 'n').statusCode).toBe(404);
    });
    it('conflict 409', () => {
      expect(AppError.conflict('C', 'c').statusCode).toBe(409);
    });
    it('unprocessable 422', () => {
      const e = AppError.unprocessable('U', 'u', [{ field: 'a', message: 'b' }]);
      expect(e.statusCode).toBe(422);
    });
    it('unprocessable defaults empty details', () => {
      expect(AppError.unprocessable('U', 'u').details).toEqual([]);
    });
    it('tooManyRequests 429 default', () => {
      const e = AppError.tooManyRequests();
      expect(e.statusCode).toBe(429);
      expect(e.message).toBe('Limite de requisições atingido');
    });
    it('tooManyRequests custom', () => {
      expect(AppError.tooManyRequests('X').message).toBe('X');
    });
    it('internal 500 default', () => {
      const e = AppError.internal();
      expect(e.statusCode).toBe(500);
      expect(e.message).toBe('Erro interno do servidor');
    });
    it('internal custom', () => {
      expect(AppError.internal('X').message).toBe('X');
    });
  });

  describe('toJSON', () => {
    it('without details', () => {
      expect(AppError.notFound('NF', 'n').toJSON()).toEqual({
        error: { code: 'NF', message: 'n' },
      });
    });
    it('with details', () => {
      const json = AppError.badRequest('V', 'v', [{ field: 'a', message: 'b' }]).toJSON();
      expect((json.error as any).details).toHaveLength(1);
    });
  });
});