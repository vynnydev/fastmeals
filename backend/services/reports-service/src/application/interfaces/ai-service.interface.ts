export interface AIInsightsInput {
    revenue: {
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
    };
    ordersByStatus: {
      status: string;
      count: number;
    }[];
    topProducts: {
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
    }[];
    avgDeliveryTime: {
      averageMinutes: number;
      fastestMinutes: number;
      slowestMinutes: number;
    };
    period: {
      startDate: string;
      endDate: string;
    };
}
  
export interface AIInsightsResult {
    summary: string;
    recommendations: string[];
    highlights: string[];
    generatedAt: string;
    model: string;
}
  
export interface IAIService {
    generateInsights(input: AIInsightsInput): Promise<AIInsightsResult>;
}