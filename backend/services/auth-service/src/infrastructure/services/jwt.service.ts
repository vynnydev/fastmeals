import jwt from 'jsonwebtoken';
import { IJwtService, TokenPayload } from '../../application/interfaces/jwt-service.interface';
import { env } from '../config/env';

export class JwtService implements IJwtService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: env.JWT_ACCESS_EXPIRATION,
        issuer: 'fastmeals-auth-service',
        subject: payload.userId,
      },
    );
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      },
      env.JWT_REFRESH_SECRET,
      {
        expiresIn: env.JWT_REFRESH_EXPIRATION,
        issuer: 'fastmeals-auth-service',
        subject: payload.userId,
      },
    );
  }

  verifyAccessToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'fastmeals-auth-service',
    }) as jwt.JwtPayload;

    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      role: decoded.role as string,
    };
  }

  verifyRefreshToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'fastmeals-auth-service',
    }) as jwt.JwtPayload;

    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
      role: decoded.role as string,
    };
  }
}