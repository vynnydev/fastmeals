export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}
  
export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
  
export interface IJwtService {
    generateAccessToken(payload: TokenPayload): string;
    generateRefreshToken(payload: TokenPayload): string;
    verifyAccessToken(token: string): TokenPayload;
    verifyRefreshToken(token: string): TokenPayload;
}