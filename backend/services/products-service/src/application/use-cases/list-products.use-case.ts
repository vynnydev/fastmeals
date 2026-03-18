import { IProductRepository, PaginatedResult } from '../../domain/repositories/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { ListProductsQueryDTO } from '../dtos/list-products-query.dto';

export class ListProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: ListProductsQueryDTO): Promise<PaginatedResult<Product>> {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    return this.productRepository.findAll({
      page,
      limit,
      search: dto.search,
      category: dto.category,
      isAvailable: dto.isAvailable,
      sortBy: dto.sortBy || 'createdAt',
      sortOrder: dto.sortOrder || 'desc',
    });
  }
}