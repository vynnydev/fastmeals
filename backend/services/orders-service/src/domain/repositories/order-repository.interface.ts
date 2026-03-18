import { Order } from '../entities/order.entity';
import { OrderStatus } from '../value-objects/order-status.vo';

export interface ListOrdersParams {
  page: number;
  limit: number;
  status?: OrderStatus;
  sortBy: 'createdAt' | 'totalAmount';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  totalAmount: number;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findAll(params: ListOrdersParams): Promise<PaginatedResult<Order>>;
  create(data: CreateOrderData): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
  assignDeliveryPerson(id: string, deliveryPersonId: string): Promise<Order>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  hasProductInActiveOrders(productId: string): Promise<boolean>;
}