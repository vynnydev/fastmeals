export interface UpdateProductDTO {
    name?: string;
    description?: string;
    price?: number;
    category?: 'meal' | 'drink' | 'dessert' | 'side';
    imageUrl?: string;
    isAvailable?: boolean;
    preparationTime?: number;
}