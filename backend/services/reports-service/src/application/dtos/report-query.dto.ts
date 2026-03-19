export interface RevenueQueryDTO {
    startDate: string;
    endDate: string;
}
  
export interface TopProductsQueryDTO {
    startDate?: string;
    endDate?: string;
    limit?: number;
}
  
export interface DeliveryTimeQueryDTO {
    startDate?: string;
    endDate?: string;
}
  
export interface AIInsightsQueryDTO {
    startDate: string;
    endDate: string;
}