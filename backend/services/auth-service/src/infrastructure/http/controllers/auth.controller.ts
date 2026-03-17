import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../../application/use-cases/refresh-token.use-case';
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator';

export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);

      const result = await this.loginUseCase.execute({
        email: validated.email,
        password: validated.password,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = refreshTokenSchema.parse(req.body);

      const result = await this.refreshTokenUseCase.execute({
        refreshToken: validated.refreshToken,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}