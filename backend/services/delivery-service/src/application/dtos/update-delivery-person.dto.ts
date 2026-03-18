export interface UpdateDeliveryPersonDTO {
    name?: string;
    phone?: string;
    vehicleType?: 'bicycle' | 'motorcycle' | 'car';
    isActive?: boolean;
    currentLatitude?: number;
    currentLongitude?: number;
}