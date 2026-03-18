import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'fastmeals-auth-service',
  }) as jwt.JwtPayload;

  return {
    userId: decoded.userId as string,
    email: decoded.email as string,
    role: decoded.role as string,
  };
}