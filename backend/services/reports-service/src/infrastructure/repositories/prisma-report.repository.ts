import { PrismaClient, Prisma } from '../../../generated/prisma/client';
import {
  IReportRepository,
  RevenueReport,
  DailyRevenue,
  OrdersByStatusReport,
  TopProductsReport,
  AvgDeliveryTimeReport,
} from '../../domain/repositories/report-repository.interface';

export class PrismaReportRepository implements IReportRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getRevenue(startDate: Date, endDate: Date): Promise<RevenueReport> {
    // Only count delivered orders for revenue
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'delivered',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0
      ? Math.round((totalRevenue / totalOrders) * 100) / 100
      : 0;

    // Group by day for daily revenue
    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey) || { revenue: 0, orders: 0 };

      existing.revenue += Number(order.totalAmount);
      existing.orders += 1;

      dailyMap.set(dateKey, existing);
    }

    const dailyRevenue: DailyRevenue[] = Array.from(dailyMap.entries()).map(
      ([date, data]) => ({
        date,
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      }),
    );

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      averageOrderValue,
      dailyRevenue,
    };
  }

  async getOrdersByStatus(): Promise<OrdersByStatusReport> {
    const statuses = ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];

    const counts = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.prisma.order.count({
          where: { status: status as any },
        });
        return { status, count };
      }),
    );

    const total = counts.reduce((sum, item) => sum + item.count, 0);

    return {
      data: counts,
      total,
    };
  }

  async getTopProducts(
    startDate?: Date,
    endDate?: Date,
    limit: number = 10,
  ): Promise<TopProductsReport> {
    const whereOrder: Prisma.OrderWhereInput = {
      status: 'delivered',
    };

    if (startDate || endDate) {
      whereOrder.createdAt = {};
      if (startDate) whereOrder.createdAt.gte = startDate;
      if (endDate) whereOrder.createdAt.lte = endDate;
    }

    // Get delivered order IDs in the period
    const deliveredOrders = await this.prisma.order.findMany({
      where: whereOrder,
      select: { id: true },
    });

    const orderIds = deliveredOrders.map((o) => o.id);

    if (orderIds.length === 0) {
      return { data: [] };
    }

    // Aggregate order items by product
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        orderId: { in: orderIds },
      },
      select: {
        productId: true,
        quantity: true,
        unitPrice: true,
      },
    });

    // Group by product
    const productMap = new Map<string, { totalQuantity: number; totalRevenue: number }>();

    for (const item of orderItems) {
      const existing = productMap.get(item.productId) || {
        totalQuantity: 0,
        totalRevenue: 0,
      };

      existing.totalQuantity += item.quantity;
      existing.totalRevenue += Number(item.unitPrice) * item.quantity;

      productMap.set(item.productId, existing);
    }

    // Get product names
    const productIds = Array.from(productMap.keys());
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const productNameMap = new Map(products.map((p) => [p.id, p.name]));

    // Sort by quantity and limit
    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: productNameMap.get(productId) || 'Produto desconhecido',
        totalQuantity: data.totalQuantity,
        totalRevenue: Math.round(data.totalRevenue * 100) / 100,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return { data: topProducts };
  }

  async getAverageDeliveryTime(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AvgDeliveryTimeReport> {
    const where: Prisma.OrderWhereInput = {
      status: 'delivered',
      deliveryPersonId: { not: null },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const deliveredOrders = await this.prisma.order.findMany({
      where,
      select: {
        createdAt: true,
        updatedAt: true,
        deliveryPersonId: true,
      },
    });

    if (deliveredOrders.length === 0) {
      return {
        averageMinutes: 0,
        fastestMinutes: 0,
        slowestMinutes: 0,
        totalDelivered: 0,
        byVehicleType: [],
      };
    }

    // Calculate delivery times (createdAt to updatedAt as delivered time)
    const deliveryTimes = deliveredOrders.map((order) => {
      const diffMs = order.updatedAt.getTime() - order.createdAt.getTime();
      return {
        minutes: Math.round(diffMs / 60000),
        deliveryPersonId: order.deliveryPersonId!,
      };
    });

    const allMinutes = deliveryTimes.map((d) => d.minutes);
    const averageMinutes = Math.round(
      (allMinutes.reduce((sum, m) => sum + m, 0) / allMinutes.length) * 10,
    ) / 10;
    const fastestMinutes = Math.min(...allMinutes);
    const slowestMinutes = Math.max(...allMinutes);

    // Group by vehicle type
    const deliveryPersonIds = [...new Set(deliveryTimes.map((d) => d.deliveryPersonId))];
    const deliveryPersons = await this.prisma.deliveryPerson.findMany({
      where: { id: { in: deliveryPersonIds } },
      select: { id: true, vehicleType: true },
    });

    const vehicleMap = new Map(deliveryPersons.map((dp) => [dp.id, dp.vehicleType]));

    const vehicleGroups = new Map<string, { totalMinutes: number; count: number }>();

    for (const dt of deliveryTimes) {
      const vehicleType = vehicleMap.get(dt.deliveryPersonId) || 'unknown';
      const existing = vehicleGroups.get(vehicleType) || { totalMinutes: 0, count: 0 };

      existing.totalMinutes += dt.minutes;
      existing.count += 1;

      vehicleGroups.set(vehicleType, existing);
    }

    const byVehicleType = Array.from(vehicleGroups.entries()).map(
      ([vehicleType, data]) => ({
        vehicleType,
        averageMinutes: Math.round((data.totalMinutes / data.count) * 10) / 10,
        count: data.count,
      }),
    );

    return {
      averageMinutes,
      fastestMinutes,
      slowestMinutes,
      totalDelivered: deliveredOrders.length,
      byVehicleType,
    };
  }
}