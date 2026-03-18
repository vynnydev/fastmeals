export enum OrderStatus {
    PENDING = 'pending',
    PREPARING = 'preparing',
    READY = 'ready',
    DELIVERING = 'delivering',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
  }
  
  // Valid transitions map
  const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
    [OrderStatus.READY]: [OrderStatus.DELIVERING, OrderStatus.CANCELLED],
    [OrderStatus.DELIVERING]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };
  
  export class OrderStatusVO {
    private readonly value: OrderStatus;
  
    constructor(status: string) {
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        throw new Error(`Invalid order status: ${status}`);
      }
      this.value = status as OrderStatus;
    }
  
    getValue(): OrderStatus {
      return this.value;
    }
  
    canTransitionTo(newStatus: OrderStatus): boolean {
      return VALID_TRANSITIONS[this.value].includes(newStatus);
    }
  
    getValidTransitions(): OrderStatus[] {
      return VALID_TRANSITIONS[this.value];
    }
  
    requiresDeliveryPerson(newStatus: OrderStatus): boolean {
      return this.value === OrderStatus.READY && newStatus === OrderStatus.DELIVERING;
    }
  
    static fromString(status: string): OrderStatusVO {
      return new OrderStatusVO(status);
    }
}