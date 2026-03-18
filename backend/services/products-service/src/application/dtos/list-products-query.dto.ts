export interface ListProductsQueryDTO {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isAvailable?: boolean;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}