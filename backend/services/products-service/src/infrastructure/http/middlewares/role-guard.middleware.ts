import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

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