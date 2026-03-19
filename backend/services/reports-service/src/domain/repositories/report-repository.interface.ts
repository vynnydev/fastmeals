export interface DailyRevenue {
    date: string;
    revenue: number;
    orders: number;
  }
  
  export interface RevenueReport {
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    dailyRevenue: DailyRevenue[];
  }
  
  export interface OrdersByStatusItem {
    status: string;
    count: number;
  }
  
  export interface OrdersByStatusReport {
    data: OrdersByStatusItem[];
    total: number;
  }
  
  export interface TopProductItem {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
  }
  
  export interface TopProductsReport {
    data: TopProductItem[];
  }
  
  export interface VehicleDeliveryTime {
    vehicleType: string;
    averageMinutes: number;
    count: number;
  }
  
  export interface AvgDeliveryTimeReport {
    averageMinutes: number;
    fastestMinutes: number;
    slowestMinutes: number;
    totalDelivered: number;
    byVehicleType: VehicleDeliveryTime[];
  }
  
  export interface IReportRepository {
    getRevenue(startDate: Date, endDate: Date): Promise<RevenueReport>;
    getOrdersByStatus(): Promise<OrdersByStatusReport>;
    getTopProducts(startDate?: Date, endDate?: Date, limit?: number): Promise<TopProductsReport>;
    getAverageDeliveryTime(startDate?: Date, endDate?: Date): Promise<AvgDeliveryTimeReport>;
}