import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { verifyAccessToken, TokenPayload } from '../../services/jwt-verify.service';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw AppError.unauthorized('INVALID_TOKEN', 'Token não fornecido');
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw AppError.unauthorized('INVALID_TOKEN', 'Token mal formado');
  }

  const token = parts[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw AppError.unauthorized('TOKEN_EXPIRED', 'Access token expirado');
      }
      if (error.message.includes('signature')) {
        throw AppError.unauthorized('INVALID_TOKEN', 'Token inválido — assinatura não confere');
      }
      if (error.message.includes('issuer')) {
        throw AppError.unauthorized('INVALID_TOKEN', 'Token inválido — issuer incorreto');
      }
    }
    throw AppError.unauthorized('INVALID_TOKEN', 'Token inválido');
  }
}