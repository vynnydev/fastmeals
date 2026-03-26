export interface User {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'meal' | 'drink' | 'dessert' | 'side';
  imageUrl: string;
  isAvailable: boolean;
  preparationTime: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  deliveryPersonId?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'motorcycle' | 'bicycle' | 'car';
  isActive: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
}