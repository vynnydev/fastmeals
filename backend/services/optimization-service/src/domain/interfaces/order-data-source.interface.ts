export interface ReadyOrder {
    id: string;
    customerName: string;
    deliveryAddress: string;
    latitude: number;
    longitude: number;
}
  
export interface IOrderDataSource {
    getReadyOrders(token: string): Promise<ReadyOrder[]>;
}