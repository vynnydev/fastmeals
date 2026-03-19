export interface AvailableDeliveryPerson {
    id: string;
    name: string;
    currentLatitude: number;
    currentLongitude: number;
}
  
export interface IDeliveryDataSource {
    getAvailableDeliveryPersons(token: string): Promise<AvailableDeliveryPerson[]>;
}