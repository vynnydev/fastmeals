import { IReportRepository } from '../../domain/repositories/report-repository.interface';
import { IAIService, AIInsightsInput, AIInsightsResult } from '../interfaces/ai-service.interface';
import { AIInsightsQueryDTO } from '../dtos/report-query.dto';

export class GetAIInsightsUseCase {
  constructor(
    private readonly reportRepository: IReportRepository,
    private readonly aiService: IAIService,
  ) {}

  async execute(dto: AIInsightsQueryDTO): Promise<AIInsightsResult> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Gather all report data in parallel
    const [revenue, ordersByStatus, topProducts, avgDeliveryTime] = await Promise.all([
      this.reportRepository.getRevenue(startDate, endDate),
      this.reportRepository.getOrdersByStatus(),
      this.reportRepository.getTopProducts(startDate, endDate, 10),
      this.reportRepository.getAverageDeliveryTime(startDate, endDate),
    ]);

    // Build input for AI analysis
    const aiInput: AIInsightsInput = {
      revenue: {
        totalRevenue: revenue.totalRevenue,
        totalOrders: revenue.totalOrders,
        averageOrderValue: revenue.averageOrderValue,
      },
      ordersByStatus: ordersByStatus.data,
      topProducts: topProducts.data.map((p) => ({
        productName: p.productName,
        totalQuantity: p.totalQuantity,
        totalRevenue: p.totalRevenue,
      })),
      avgDeliveryTime: {
        averageMinutes: avgDeliveryTime.averageMinutes,
        fastestMinutes: avgDeliveryTime.fastestMinutes,
        slowestMinutes: avgDeliveryTime.slowestMinutes,
      },
      period: {
        startDate: dto.startDate,
        endDate: dto.endDate,
      },
    };

    // Generate AI insights
    return this.aiService.generateInsights(aiInput);
  }
}