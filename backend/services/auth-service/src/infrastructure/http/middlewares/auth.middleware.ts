import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';
import { JwtService } from '../../services/jwt.service';
import { TokenPayload } from '../../../application/interfaces/jwt-service.interface';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const jwtService = new JwtService();

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
    const payload = jwtService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized('TOKEN_EXPIRED', 'Access token expirado');
  }
}

export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw AppError.unauthorized('INVALID_TOKEN', 'Token não fornecido');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw AppError.forbidden();
    }

    next();
  };
}