import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaUserRepository } from '../../src/infrastructure/repositories/prisma-user.repository';
import { User } from '../../src/domain/entities/user.entity';

const mockPrismaUser = {
  findUnique: vi.fn(),
};

const mockPrisma = {
  user: mockPrismaUser,
} as any;

const sampleRecord = {
  id: 'user-001',
  email: 'admin@fastmeals.com',
  password: '$2b$10$hashedpassword',
  role: 'admin',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('PrismaUserRepository', () => {
  let repo: PrismaUserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaUserRepository(mockPrisma);
  });

  describe('findByEmail', () => {
    it('should return User when found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(sampleRecord);

      const result = await repo.findByEmail('admin@fastmeals.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('admin@fastmeals.com');
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@fastmeals.com' },
      });
    });

    it('should return null when not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const result = await repo.findByEmail('nonexistent@email.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return User when found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(sampleRecord);

      const result = await repo.findById('user-001');

      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-001');
      expect(mockPrismaUser.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-001' },
      });
    });

    it('should return null when not found', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('toDomain mapping', () => {
    it('should correctly map role from string to UserRole', async () => {
      mockPrismaUser.findUnique.mockResolvedValue({ ...sampleRecord, role: 'viewer' });

      const result = await repo.findByEmail('admin@fastmeals.com');

      expect(result?.role).toBe('viewer');
    });

    it('should correctly map dates', async () => {
      mockPrismaUser.findUnique.mockResolvedValue(sampleRecord);

      const result = await repo.findById('user-001');

      expect(result?.createdAt).toEqual(new Date('2026-01-01'));
      expect(result?.updatedAt).toEqual(new Date('2026-01-02'));
    });
  });
});