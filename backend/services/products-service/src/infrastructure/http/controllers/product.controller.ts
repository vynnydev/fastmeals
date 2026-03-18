import { Request, Response, NextFunction } from 'express';
import { CreateProductUseCase } from '../../../application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../../application/use-cases/delete-product.use-case';
import { GetProductUseCase } from '../../../application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../../../application/use-cases/list-products.use-case';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  productIdSchema,
} from '../validators/product.validator';

export class ProductController {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly listProductsUseCase: ListProductsUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await this.createProductUseCase.execute(validated);

      res.status(201).json(product.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = productIdSchema.parse(req.params);
      const validated = updateProductSchema.parse(req.body);
      const product = await this.updateProductUseCase.execute(id, validated);

      res.status(200).json(product.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = productIdSchema.parse(req.params);
      await this.deleteProductUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = productIdSchema.parse(req.params);
      const product = await this.getProductUseCase.execute(id);

      res.status(200).json(product.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listProductsQuerySchema.parse(req.query);

      const result = await this.listProductsUseCase.execute({
        page: query.page,
        limit: query.limit,
        search: query.search,
        category: query.category,
        isAvailable: query.isAvailable,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      res.status(200).json({
        data: result.data.map((product) => product.toJSON()),
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}