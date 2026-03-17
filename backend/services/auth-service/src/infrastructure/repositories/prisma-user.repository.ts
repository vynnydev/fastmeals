import { PrismaClient } from '../../../generated/prisma/client';
import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { User, UserRole } from '../../domain/entities/user.entity';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  private toDomain(record: {
    id: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User({
      id: record.id,
      email: record.email,
      password: record.password,
      role: record.role as UserRole,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}