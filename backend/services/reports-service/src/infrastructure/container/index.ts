import { getPrismaClient } from '../database/prisma-client';
import { PrismaReportRepository } from '../repositories/prisma-report.repository';
import { BedrockAIService } from '../services/bedrock-ai.service';
import { GetRevenueUseCase } from '../../application/use-cases/get-revenue.use-case';
import { GetOrdersByStatusUseCase } from '../../application/use-cases/get-orders-by-status.use-case';
import { GetTopProductsUseCase } from '../../application/use-cases/get-top-products.use-case';
import { GetAvgDeliveryTimeUseCase } from '../../application/use-cases/get-avg-delivery-time.use-case';
import { GetAIInsightsUseCase } from '../../application/use-cases/get-ai-insights.use-case';
import { ReportController } from '../http/controllers/report.controller';

export interface Container {
  reportController: ReportController;
}

export function createContainer(): Container {
  const prisma = getPrismaClient();

  // Repository
  const reportRepository = new PrismaReportRepository(prisma);

  // AI Service
  const aiService = new BedrockAIService();

  // Use Cases
  const getRevenueUseCase = new GetRevenueUseCase(reportRepository);
  const getOrdersByStatusUseCase = new GetOrdersByStatusUseCase(reportRepository);
  const getTopProductsUseCase = new GetTopProductsUseCase(reportRepository);
  const getAvgDeliveryTimeUseCase = new GetAvgDeliveryTimeUseCase(reportRepository);
  const getAIInsightsUseCase = new GetAIInsightsUseCase(reportRepository, aiService);

  // Controller
  const reportController = new ReportController(
    getRevenueUseCase,
    getOrdersByStatusUseCase,
    getTopProductsUseCase,
    getAvgDeliveryTimeUseCase,
    getAIInsightsUseCase,
  );

  return {
    reportController,
  };
}