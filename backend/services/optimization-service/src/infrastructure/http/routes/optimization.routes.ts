import { Router } from 'express';
import { OptimizationController } from '../controllers/optimization.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleGuard } from '../middlewares/role-guard.middleware';

export function createOptimizationRoutes(controller: OptimizationController): Router {
  const router = Router();

  router.use(authMiddleware);

  // POST /api/orders/optimize-assignment — admin only
  router.post('/optimize-assignment', roleGuard('admin'), (req, res, next) =>
    controller.optimize(req, res, next),
  );

  return router;
}