import Redis from 'ioredis';
import { ITokenStore } from '../../application/interfaces/token-store.interface';

export class RedisTokenStoreService implements ITokenStore {
  private readonly redis: Redis;
  private readonly prefix = 'auth:refresh_token:';

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number): number | null {
        if (times > 3) {
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.redis.on('error', (error) => {
      console.error('Redis connection error:', error.message);
    });

    this.redis.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  async storeRefreshToken(userId: string, token: string, ttlSeconds: number): Promise<void> {
    const key = this.buildKey(userId);
    await this.redis.set(key, token, 'EX', ttlSeconds);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = this.buildKey(userId);
    return this.redis.get(key);
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    const key = this.buildKey(userId);
    await this.redis.del(key);
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  private buildKey(userId: string): string {
    return `${this.prefix}${userId}`;
  }
}