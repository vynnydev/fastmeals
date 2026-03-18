import { getPrismaClient } from '../database/prisma-client';
import { PrismaProductRepository } from '../repositories/prisma-product.repository';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { ProductController } from '../http/controllers/product.controller';

export interface Container {
  productController: ProductController;
}

export function createContainer(): Container {
  // Database
  const prisma = getPrismaClient();

  // Repositories
  const productRepository = new PrismaProductRepository(prisma);

  // Use Cases
  const createProductUseCase = new CreateProductUseCase(productRepository);
  const updateProductUseCase = new UpdateProductUseCase(productRepository);
  const deleteProductUseCase = new DeleteProductUseCase(productRepository);
  const getProductUseCase = new GetProductUseCase(productRepository);
  const listProductsUseCase = new ListProductsUseCase(productRepository);

  // Controllers
  const productController = new ProductController(
    createProductUseCase,
    updateProductUseCase,
    deleteProductUseCase,
    getProductUseCase,
    listProductsUseCase,
  );

  return {
    productController,
  };
}