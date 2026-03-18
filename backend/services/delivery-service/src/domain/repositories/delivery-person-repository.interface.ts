import { DeliveryPerson } from '../entities/delivery-person.entity';

export interface ListDeliveryPersonsParams {
  isActive?: boolean;
  available?: boolean; // true = no delivering order assigned
}

export interface CreateDeliveryPersonData {
  name: string;
  phone: string;
  vehicleType: string;
  isActive?: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
}

export interface UpdateDeliveryPersonData {
  name?: string;
  phone?: string;
  vehicleType?: string;
  isActive?: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
}

export interface IDeliveryPersonRepository {
  findById(id: string): Promise<DeliveryPerson | null>;
  findAll(params: ListDeliveryPersonsParams): Promise<DeliveryPerson[]>;
  findActiveWithoutDeliveringOrder(): Promise<DeliveryPerson[]>;
  create(data: CreateDeliveryPersonData): Promise<DeliveryPerson>;
  update(id: string, data: UpdateDeliveryPersonData): Promise<DeliveryPerson>;
  delete(id: string): Promise<void>;
  isAssignedToDeliveringOrder(deliveryPersonId: string): Promise<boolean>;
}