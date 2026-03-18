export interface ListOrdersQueryDTO {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: 'createdAt' | 'totalAmount';
    sortOrder?: 'asc' | 'desc';
}