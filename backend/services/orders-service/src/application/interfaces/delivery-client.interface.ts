export interface DeliveryPersonInfo {
    id: string;
    name: string;
    isActive: boolean;
    currentOrderId: string | null;
}
  
export interface IDeliveryClient {
    getDeliveryPersonById(id: string, token: string): Promise<DeliveryPersonInfo | null>;
    isDeliveryPersonAvailable(id: string, token: string): Promise<boolean>;
}