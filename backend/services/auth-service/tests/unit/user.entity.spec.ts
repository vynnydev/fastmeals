import { describe, it, expect } from 'vitest';
import { User, UserRole } from '../../src/domain/entities/user.entity';

describe('User Entity', () => {
  const now = new Date();

  const adminProps = {
    id: 'user-001',
    email: 'admin@fastmeals.com',
    password: 'hashed-password-123',
    role: UserRole.ADMIN,
    createdAt: now,
    updatedAt: now,
  };

  const viewerProps = {
    id: 'user-002',
    email: 'viewer@fastmeals.com',
    password: 'hashed-password-456',
    role: UserRole.VIEWER,
    createdAt: now,
    updatedAt: now,
  };

  describe('getters', () => {
    it('should return correct id', () => {
      const user = new User(adminProps);
      expect(user.id).toBe('user-001');
    });

    it('should return correct email', () => {
      const user = new User(adminProps);
      expect(user.email).toBe('admin@fastmeals.com');
    });

    it('should return correct password', () => {
      const user = new User(adminProps);
      expect(user.password).toBe('hashed-password-123');
    });

    it('should return correct role', () => {
      const user = new User(adminProps);
      expect(user.role).toBe(UserRole.ADMIN);
    });

    it('should return correct createdAt', () => {
      const user = new User(adminProps);
      expect(user.createdAt).toBe(now);
    });

    it('should return correct updatedAt', () => {
      const user = new User(adminProps);
      expect(user.updatedAt).toBe(now);
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const user = new User(adminProps);
      expect(user.isAdmin()).toBe(true);
    });

    it('should return false for viewer user', () => {
      const user = new User(viewerProps);
      expect(user.isAdmin()).toBe(false);
    });
  });

  describe('isViewer', () => {
    it('should return true for viewer user', () => {
      const user = new User(viewerProps);
      expect(user.isViewer()).toBe(true);
    });

    it('should return false for admin user', () => {
      const user = new User(adminProps);
      expect(user.isViewer()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return user data without password', () => {
      const user = new User(adminProps);
      const json = user.toJSON();

      expect(json.id).toBe('user-001');
      expect(json.email).toBe('admin@fastmeals.com');
      expect(json.role).toBe(UserRole.ADMIN);
      expect(json.createdAt).toBe(now);
      expect(json.updatedAt).toBe(now);
      expect((json as Record<string, unknown>).password).toBeUndefined();
    });

    it('should not expose password in JSON', () => {
      const user = new User(adminProps);
      const json = user.toJSON();
      const jsonString = JSON.stringify(json);

      expect(jsonString).not.toContain('hashed-password-123');
    });
  });

  describe('UserRole enum', () => {
    it('should have ADMIN value', () => {
      expect(UserRole.ADMIN).toBe('admin');
    });

    it('should have VIEWER value', () => {
      expect(UserRole.VIEWER).toBe('viewer');
    });
  });
});