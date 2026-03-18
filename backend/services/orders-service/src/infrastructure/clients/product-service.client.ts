import axios, { AxiosInstance } from 'axios';
import { IProductClient, ProductInfo } from '../../application/interfaces/product-client.interface';
import { env } from '../config/env';

export class ProductServiceClient implements IProductClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.PRODUCTS_SERVICE_URL,
      timeout: 5000,
    });
  }

  async getProductById(productId: string, token: string): Promise<ProductInfo | null> {
    try {
      const response = await this.http.get(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        id: response.data.id,
        name: response.data.name,
        price: response.data.price,
        isAvailable: response.data.isAvailable,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getProductsByIds(productIds: string[], token: string): Promise<ProductInfo[]> {
    const products: ProductInfo[] = [];

    // Fetch products in parallel
    const promises = productIds.map((id) => this.getProductById(id, token));
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        products.push(result.value);
      }
    }

    return products;
  }
}