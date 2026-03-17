import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '../../application/interfaces/password-hasher.interface';

const SALT_ROUNDS = 10;

export class BcryptService implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}