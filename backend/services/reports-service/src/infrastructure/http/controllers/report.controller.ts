import { Request, Response, NextFunction } from 'express';
import { GetRevenueUseCase } from '../../../application/use-cases/get-revenue.use-case';
import { GetOrdersByStatusUseCase } from '../../../application/use-cases/get-orders-by-status.use-case';
import { GetTopProductsUseCase } from '../../../application/use-cases/get-top-products.use-case';
import { GetAvgDeliveryTimeUseCase } from '../../../application/use-cases/get-avg-delivery-time.use-case';
import { GetAIInsightsUseCase } from '../../../application/use-cases/get-ai-insights.use-case';
import {
  revenueQuerySchema,
  topProductsQuerySchema,
  deliveryTimeQuerySchema,
  aiInsightsQuerySchema,
} from '../validators/report.validator';

export class ReportController {
  constructor(
    private readonly getRevenueUseCase: GetRevenueUseCase,
    private readonly getOrdersByStatusUseCase: GetOrdersByStatusUseCase,
    private readonly getTopProductsUseCase: GetTopProductsUseCase,
    private readonly getAvgDeliveryTimeUseCase: GetAvgDeliveryTimeUseCase,
    private readonly getAIInsightsUseCase: GetAIInsightsUseCase,
  ) {}

  async getRevenue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = revenueQuerySchema.parse(req.query);
      const result = await this.getRevenueUseCase.execute(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOrdersByStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.getOrdersByStatusUseCase.execute();

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = topProductsQuerySchema.parse(req.query);
      const result = await this.getTopProductsUseCase.execute(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAvgDeliveryTime(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = deliveryTimeQuerySchema.parse(req.query);
      const result = await this.getAvgDeliveryTimeUseCase.execute(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAIInsights(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = aiInsightsQuerySchema.parse(req.query);
      const result = await this.getAIInsightsUseCase.execute(query);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}