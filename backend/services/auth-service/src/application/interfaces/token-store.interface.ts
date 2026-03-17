export interface ITokenStore {
    storeRefreshToken(userId: string, token: string, ttlSeconds: number): Promise<void>;
    getRefreshToken(userId: string): Promise<string | null>;
    revokeRefreshToken(userId: string): Promise<void>;
}