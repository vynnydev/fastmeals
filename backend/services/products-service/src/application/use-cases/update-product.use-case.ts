import { IProductRepository } from '../../domain/repositories/product-repository.interface';
import { Product, ProductCategory } from '../../domain/entities/product.entity';
import { UpdateProductDTO } from '../dtos/update-product.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, dto: UpdateProductDTO): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);

    if (!existingProduct) {
      throw AppError.notFound('PRODUCT_NOT_FOUND', 'Produto não encontrado');
    }

    const { category, ...rest } = dto;

    const updatedProduct = await this.productRepository.update(id, {
      ...rest,
      ...(category && { category: category as unknown as ProductCategory }),
    });

    return updatedProduct;
  }
}