import axios, { AxiosInstance } from 'axios';
import {
  IDeliveryDataSource,
  AvailableDeliveryPerson,
} from '../../domain/interfaces/delivery-data-source.interface';
import { env } from '../config/env';

export class DeliveryServiceClient implements IDeliveryDataSource {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.DELIVERY_SERVICE_URL,
      timeout: 5000,
    });
  }

  async getAvailableDeliveryPersons(token: string): Promise<AvailableDeliveryPerson[]> {
    try {
      const response = await this.http.get('/api/delivery-persons', {
        params: { available: 'true' },
        headers: { Authorization: `Bearer ${token}` },
      });

      const persons = response.data?.data || [];

      return persons
        .filter(
          (p: Record<string, unknown>) =>
            p.currentLatitude !== null && p.currentLongitude !== null,
        )
        .map((person: Record<string, unknown>) => ({
          id: person.id as string,
          name: person.name as string,
          currentLatitude: Number(person.currentLatitude),
          currentLongitude: Number(person.currentLongitude),
        }));
    } catch (error) {
      console.error('❌ Failed to fetch delivery persons:', error instanceof Error ? error.message : error);
      return [];
    }
  }
}