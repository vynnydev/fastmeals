import { describe, it, expect } from 'vitest';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create with all properties', () => {
      const e = new AppError(400, 'T', 'msg', [{ field: 'x', message: 'y' }]);
      expect(e.statusCode).toBe(400);
      expect(e.code).toBe('T');
      expect(e.details).toHaveLength(1);
    });
    it('should default details to empty', () => { expect(new AppError(500, 'E', 'm').details).toEqual([]); });
    it('should be instance of Error and AppError', () => {
      const e = new AppError(400, 'E', 'm');
      expect(e).toBeInstanceOf(Error);
      expect(e).toBeInstanceOf(AppError);
    });
  });

  describe('static factories', () => {
    it('badRequest 400', () => { expect(AppError.badRequest('V', 'b', [{ field: 'a', message: 'b' }]).statusCode).toBe(400); });
    it('badRequest defaults empty', () => { expect(AppError.badRequest('V', 'b').details).toEqual([]); });
    it('unauthorized 401', () => { expect(AppError.unauthorized('U', 'n').statusCode).toBe(401); });
    it('forbidden 403 default', () => { const e = AppError.forbidden(); expect(e.statusCode).toBe(403); expect(e.message).toBe('Permissão insuficiente para a ação'); });
    it('forbidden custom', () => { expect(AppError.forbidden('X').message).toBe('X'); });
    it('notFound 404', () => { expect(AppError.notFound('NF', 'n').statusCode).toBe(404); });
    it('conflict 409', () => { expect(AppError.conflict('C', 'c').statusCode).toBe(409); });
    it('unprocessable 422', () => { expect(AppError.unprocessable('U', 'u', [{ field: 'a', message: 'b' }]).statusCode).toBe(422); });
    it('unprocessable defaults', () => { expect(AppError.unprocessable('U', 'u').details).toEqual([]); });
    it('tooManyRequests 429', () => { expect(AppError.tooManyRequests().statusCode).toBe(429); });
    it('tooManyRequests custom', () => { expect(AppError.tooManyRequests('X').message).toBe('X'); });
    it('internal 500', () => { expect(AppError.internal().statusCode).toBe(500); });
    it('internal custom', () => { expect(AppError.internal('X').message).toBe('X'); });
  });

  describe('toJSON', () => {
    it('without details', () => { expect(AppError.notFound('NF', 'n').toJSON()).toEqual({ error: { code: 'NF', message: 'n' } }); });
    it('with details', () => { expect((AppError.badRequest('V', 'v', [{ field: 'a', message: 'b' }]).toJSON().error as any).details).toHaveLength(1); });
  });
});