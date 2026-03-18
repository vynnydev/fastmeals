import { PrismaClient, Prisma } from '../../../generated/prisma/client';
import {
  IOrderRepository,
  ListOrdersParams,
  PaginatedResult,
  CreateOrderData,
} from '../../domain/repositories/order-repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';

export class PrismaOrderRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const record = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(params: ListOrdersParams): Promise<PaginatedResult<Order>> {
    const where: Prisma.OrderWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    orderBy[params.sortBy] = params.sortOrder;

    const skip = (params.page - 1) * params.limit;

    const [records, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy,
        skip,
        take: params.limit,
        include: { items: true },
      }),
      this.prisma.order.count({ where }),
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

  async create(data: CreateOrderData): Promise<Order> {
    const record = await this.prisma.order.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        status: 'pending',
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return this.toDomain(record);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const record = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    return this.toDomain(record);
  }

  async assignDeliveryPerson(id: string, deliveryPersonId: string): Promise<Order> {
    const record = await this.prisma.order.update({
      where: { id },
      data: { deliveryPersonId },
      include: { items: true },
    });

    return this.toDomain(record);
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const records = await this.prisma.order.findMany({
      where: { status },
      include: { items: true },
    });

    return records.map((record) => this.toDomain(record));
  }

  async hasProductInActiveOrders(productId: string): Promise<boolean> {
    const count = await this.prisma.orderItem.count({
      where: {
        productId,
        order: {
          status: {
            in: ['pending', 'preparing'],
          },
        },
      },
    });

    return count > 0;
  }

  private toDomain(
    record: {
      id: string;
      customerName: string;
      customerPhone: string;
      deliveryAddress: string;
      latitude: Prisma.Decimal | number;
      longitude: Prisma.Decimal | number;
      status: string;
      totalAmount: Prisma.Decimal | number;
      deliveryPersonId: string | null;
      createdAt: Date;
      updatedAt: Date;
      items: {
        id: string;
        orderId: string;
        productId: string;
        quantity: number;
        unitPrice: Prisma.Decimal | number;
        createdAt: Date;
      }[];
    },
  ): Order {
    const items = record.items.map(
      (item) =>
        new OrderItem({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.unitPrice),
          createdAt: item.createdAt,
        }),
    );

    return new Order({
      id: record.id,
      customerName: record.customerName,
      customerPhone: record.customerPhone,
      deliveryAddress: record.deliveryAddress,
      latitude: typeof record.latitude === 'number' ? record.latitude : Number(record.latitude),
      longitude: typeof record.longitude === 'number' ? record.longitude : Number(record.longitude),
      status: record.status as OrderStatus,
      totalAmount: typeof record.totalAmount === 'number' ? record.totalAmount : Number(record.totalAmount),
      deliveryPersonId: record.deliveryPersonId,
      items,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}