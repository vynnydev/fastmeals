import { OrderItem } from './order-item.entity';
import { OrderStatus, OrderStatusVO } from '../value-objects/order-status.vo';

export interface OrderProps {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryPersonId: string | null;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Order {
  private readonly props: OrderProps;
  private readonly statusVO: OrderStatusVO;

  constructor(props: OrderProps) {
    this.props = props;
    this.statusVO = new OrderStatusVO(props.status);
  }

  get id(): string {
    return this.props.id;
  }

  get customerName(): string {
    return this.props.customerName;
  }

  get customerPhone(): string {
    return this.props.customerPhone;
  }

  get deliveryAddress(): string {
    return this.props.deliveryAddress;
  }

  get latitude(): number {
    return this.props.latitude;
  }

  get longitude(): number {
    return this.props.longitude;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get totalAmount(): number {
    return this.props.totalAmount;
  }

  get deliveryPersonId(): string | null {
    return this.props.deliveryPersonId;
  }

  get items(): OrderItem[] {
    return this.props.items;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  canTransitionTo(newStatus: OrderStatus): boolean {
    return this.statusVO.canTransitionTo(newStatus);
  }

  getValidTransitions(): OrderStatus[] {
    return this.statusVO.getValidTransitions();
  }

  requiresDeliveryPerson(newStatus: OrderStatus): boolean {
    return this.statusVO.requiresDeliveryPerson(newStatus);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.id,
      customerName: this.props.customerName,
      customerPhone: this.props.customerPhone,
      deliveryAddress: this.props.deliveryAddress,
      latitude: this.props.latitude,
      longitude: this.props.longitude,
      status: this.props.status,
      totalAmount: this.props.totalAmount,
      deliveryPersonId: this.props.deliveryPersonId,
      items: this.props.items.map((item) => item.toJSON()),
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}