import axios, { AxiosInstance } from 'axios';
import { IOrderDataSource, ReadyOrder } from '../../domain/interfaces/order-data-source.interface';
import { env } from '../config/env';

export class OrdersServiceClient implements IOrderDataSource {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.ORDERS_SERVICE_URL,
      timeout: 5000,
    });
  }

  async getReadyOrders(token: string): Promise<ReadyOrder[]> {
    try {
      const response = await this.http.get('/api/orders', {
        params: { status: 'ready', limit: 100 },
        headers: { Authorization: `Bearer ${token}` },
      });

      const orders = response.data?.data || [];

      return orders.map((order: Record<string, unknown>) => ({
        id: order.id as string,
        customerName: order.customerName as string,
        deliveryAddress: order.deliveryAddress as string,
        latitude: Number(order.latitude),
        longitude: Number(order.longitude),
      }));
    } catch (error) {
      console.error('❌ Failed to fetch ready orders:', error instanceof Error ? error.message : error);
      return [];
    }
  }
}