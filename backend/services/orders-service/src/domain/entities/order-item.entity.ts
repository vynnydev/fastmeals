export interface OrderItemProps {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    createdAt: Date;
  }
  
  export class OrderItem {
    private readonly props: OrderItemProps;
  
    constructor(props: OrderItemProps) {
      this.props = props;
    }
  
    get id(): string {
      return this.props.id;
    }
  
    get orderId(): string {
      return this.props.orderId;
    }
  
    get productId(): string {
      return this.props.productId;
    }
  
    get quantity(): number {
      return this.props.quantity;
    }
  
    get unitPrice(): number {
      return this.props.unitPrice;
    }
  
    get createdAt(): Date {
      return this.props.createdAt;
    }
  
    get subtotal(): number {
      return this.props.quantity * this.props.unitPrice;
    }
  
    toJSON(): OrderItemProps & { subtotal: number } {
      return {
        ...this.props,
        subtotal: this.subtotal,
      };
    }
}