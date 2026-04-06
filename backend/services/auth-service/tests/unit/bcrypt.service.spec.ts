import { describe, it, expect } from 'vitest';
import { BcryptService } from '../../src/infrastructure/services/bcrypt.service';

describe('BcryptService', () => {
  const bcryptService = new BcryptService();

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'Admin@123';
      const hashed = await bcryptService.hash(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Admin@123';
      const hash1 = await bcryptService.hash(password);
      const hash2 = await bcryptService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const password = 'Admin@123';
      const hashed = await bcryptService.hash(password);
      const result = await bcryptService.compare(password, hashed);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hashed = await bcryptService.hash('Admin@123');
      const result = await bcryptService.compare('wrong-password', hashed);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hashed = await bcryptService.hash('Admin@123');
      const result = await bcryptService.compare('', hashed);

      expect(result).toBe(false);
    });
  });
});