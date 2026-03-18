import axios, { AxiosInstance } from 'axios';
import { IDeliveryClient, DeliveryPersonInfo } from '../../application/interfaces/delivery-client.interface';
import { env } from '../config/env';

export class DeliveryServiceClient implements IDeliveryClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.DELIVERY_SERVICE_URL,
      timeout: 5000,
    });
  }

  async getDeliveryPersonById(id: string, token: string): Promise<DeliveryPersonInfo | null> {
    try {
      const response = await this.http.get(`/api/delivery-persons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        isActive: response.data.isActive,
        currentOrderId: response.data.currentOrderId || null,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async isDeliveryPersonAvailable(id: string, token: string): Promise<boolean> {
    const person = await this.getDeliveryPersonById(id, token);

    if (!person) {
      return false;
    }

    return person.isActive && person.currentOrderId === null;
  }
}