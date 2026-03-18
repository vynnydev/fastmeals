export interface ProductInfo {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}
  
export interface IProductClient {
    getProductById(productId: string, token: string): Promise<ProductInfo | null>;
    getProductsByIds(productIds: string[], token: string): Promise<ProductInfo[]>;
}