import { IProductRepository } from '../../domain/repositories/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class GetProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw AppError.notFound('PRODUCT_NOT_FOUND', 'Produto não encontrado');
    }

    return product;
  }
}