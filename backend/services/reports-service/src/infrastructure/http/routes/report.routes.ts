import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createReportRoutes(controller: ReportController): Router {
  const router = Router();

  // All report routes require authentication (admin or viewer)
  router.use(authMiddleware);

  router.get('/revenue', (req, res, next) => controller.getRevenue(req, res, next));
  router.get('/orders-by-status', (req, res, next) => controller.getOrdersByStatus(req, res, next));
  router.get('/top-products', (req, res, next) => controller.getTopProducts(req, res, next));
  router.get('/average-delivery-time', (req, res, next) => controller.getAvgDeliveryTime(req, res, next));
  router.get('/ai-insights', (req, res, next) => controller.getAIInsights(req, res, next));

  return router;
}