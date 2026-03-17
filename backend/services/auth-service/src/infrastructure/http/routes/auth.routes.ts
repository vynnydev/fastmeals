import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post('/login', (req, res, next) => controller.login(req, res, next));
  router.post('/refresh', (req, res, next) => controller.refreshToken(req, res, next));

  return router;
}