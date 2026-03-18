export interface CreateOrderItemDTO {
    productId: string;
    quantity: number;
}
  
export interface CreateOrderDTO {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    latitude: number;
    longitude: number;
    items: CreateOrderItemDTO[];
}