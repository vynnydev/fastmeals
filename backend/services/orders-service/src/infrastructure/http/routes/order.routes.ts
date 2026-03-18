import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleGuard } from '../middlewares/role-guard.middleware';

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // Read routes — admin and viewer
  router.get('/', (req, res, next) => controller.list(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));

  // Write routes — admin only
  router.post('/', roleGuard('admin'), (req, res, next) => controller.create(req, res, next));
  router.patch('/:id/status', roleGuard('admin'), (req, res, next) => controller.updateStatus(req, res, next));
  router.patch('/:id/assign', roleGuard('admin'), (req, res, next) => controller.assignDeliveryPerson(req, res, next));

  return router;
}