import { IProductRepository } from '../../domain/repositories/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { UpdateProductDTO } from '../dtos/update-product.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, dto: UpdateProductDTO): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw AppError.notFound('PRODUCT_NOT_FOUND', 'Produto não encontrado');
    }

    const updatedProduct = await this.productRepository.update(id, dto);

    return updatedProduct;
  }
}