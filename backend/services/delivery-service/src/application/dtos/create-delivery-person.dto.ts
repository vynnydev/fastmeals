export interface CreateDeliveryPersonDTO {
    name: string;
    phone: string;
    vehicleType: 'bicycle' | 'motorcycle' | 'car';
    currentLatitude?: number;
    currentLongitude?: number;
}