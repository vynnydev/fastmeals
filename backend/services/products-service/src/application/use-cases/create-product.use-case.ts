import { IProductRepository } from '../../domain/repositories/product-repository.interface';
import { Product } from '../../domain/entities/product.entity';
import { CreateProductDTO } from '../dtos/create-product.dto';

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(dto: CreateProductDTO): Promise<Product> {
    const product = await this.productRepository.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      imageUrl: dto.imageUrl || null,
      isAvailable: true,
      preparationTime: dto.preparationTime,
    } as Product);

    return product;
  }
}