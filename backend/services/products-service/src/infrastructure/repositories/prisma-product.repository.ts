import { PrismaClient, Prisma } from '../../../generated/prisma/client';
import {
  IProductRepository,
  ListProductsParams,
  PaginatedResult,
} from '../../domain/repositories/product-repository.interface';
import { Product, ProductCategory } from '../../domain/entities/product.entity';

export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const record = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(params: ListProductsParams): Promise<PaginatedResult<Product>> {
    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.name = {
        contains: params.search,
        mode: 'insensitive',
      };
    }

    if (params.category) {
      where.category = params.category as ProductCategory;
    }

    if (params.isAvailable !== undefined) {
      where.isAvailable = params.isAvailable;
    }

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    const sortField = params.sortBy === 'createdAt' ? 'createdAt' : params.sortBy;
    orderBy[sortField] = params.sortOrder;

    const skip = (params.page - 1) * params.limit;

    const [records, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: params.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: records.map((record) => this.toDomain(record)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const record = await this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        imageUrl: data.imageUrl,
        isAvailable: data.isAvailable,
        preparationTime: data.preparationTime,
      },
    });

    return this.toDomain(record);
  }

  async update(
    id: string,
    data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Product> {
    const updateData: Prisma.ProductUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
    if (data.preparationTime !== undefined) updateData.preparationTime = data.preparationTime;

    const record = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async hasActiveOrders(productId: string): Promise<boolean> {
    // Este método será implementado via HTTP call ao orders-service
    // Por enquanto, retorna false (o orders-service ainda não existe)
    // Quando o orders-service estiver pronto, substituir por HTTP client
    //
    // Em produção, isso seria feito via:
    // 1. HTTP call: GET orders-service/api/orders?productId=X&status=pending,preparing
    // 2. Ou via evento: verificar cache local alimentado por mensageria
    //
    // TODO: Implementar OrdersServiceClient quando orders-service estiver pronto
    return false;
  }

  private toDomain(record: {
    id: string;
    name: string;
    description: string;
    price: Prisma.Decimal | number;
    category: string;
    imageUrl: string | null;
    isAvailable: boolean;
    preparationTime: number;
    createdAt: Date;
    updatedAt: Date;
  }): Product {
    return new Product({
      id: record.id,
      name: record.name,
      description: record.description,
      price: typeof record.price === 'number' ? record.price : Number(record.price),
      category: record.category as ProductCategory,
      imageUrl: record.imageUrl,
      isAvailable: record.isAvailable,
      preparationTime: record.preparationTime,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}