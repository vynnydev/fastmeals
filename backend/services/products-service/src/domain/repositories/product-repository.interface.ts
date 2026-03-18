import { Product } from '../entities/product.entity';

export interface ListProductsParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  isAvailable?: boolean;
  sortBy: 'name' | 'price' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(params: ListProductsParams): Promise<PaginatedResult<Product>>;
  create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  update(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product>;
  delete(id: string): Promise<void>;
  hasActiveOrders(productId: string): Promise<boolean>;
}