export interface CreateProductDTO {
    name: string;
    description: string;
    price: number;
    category: 'meal' | 'drink' | 'dessert' | 'side';
    imageUrl?: string;
    preparationTime: number;
}