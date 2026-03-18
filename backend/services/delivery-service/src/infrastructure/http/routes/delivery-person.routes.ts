import { Router } from 'express';
import { DeliveryPersonController } from '../controllers/delivery-person.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleGuard } from '../middlewares/role-guard.middleware';

export function createDeliveryPersonRoutes(controller: DeliveryPersonController): Router {
  const router = Router();

  // All routes require authentication
  router.use(authMiddleware);

  // Read routes — admin and viewer
  router.get('/', (req, res, next) => controller.list(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));

  // Write routes — admin only
  router.post('/', roleGuard('admin'), (req, res, next) => controller.create(req, res, next));
  router.put('/:id', roleGuard('admin'), (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', roleGuard('admin'), (req, res, next) => controller.delete(req, res, next));

  return router;
}