import { IProductRepository } from '../../domain/repositories/product-repository.interface';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw AppError.notFound('PRODUCT_NOT_FOUND', 'Produto não encontrado');
    }

    const hasActiveOrders = await this.productRepository.hasActiveOrders(id);

    if (hasActiveOrders) {
      throw AppError.conflict(
        'PRODUCT_IN_USE',
        'Não é possível deletar este produto pois ele está vinculado a pedidos com status \'pending\' ou \'preparing\'',
      );
    }

    await this.productRepository.delete(id);
  }
}