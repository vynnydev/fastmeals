import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface SeedOrderItem {
  productIndex: number;
  quantity: number;
}

interface SeedOrder {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  latitude: number;
  longitude: number;
  status: string;
  deliveryPersonIndex?: number;
  items: SeedOrderItem[];
}

interface SeedProduct {
  name: string;
  price: number;
}

interface SeedData {
  products: SeedProduct[];
  orders: SeedOrder[];
}

async function main(): Promise<void> {
  console.log('🌱 Seeding orders database...');

  const dataPath = path.resolve(process.cwd(), '../../../seed/data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const seedData: SeedData = JSON.parse(rawData);

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  // We need product IDs from the products-service
  // For seeding, we'll generate deterministic UUIDs based on product index
  // In production, this would fetch from products-service
  const productUuids = seedData.products.map(
    (_, index) => `00000000-0000-4000-a000-${String(index).padStart(12, '0')}`,
  );

  // Similarly for delivery persons
  const deliveryPersonUuids = [
    '10000000-0000-4000-a000-000000000001',
    '10000000-0000-4000-a000-000000000002',
    '10000000-0000-4000-a000-000000000003',
    '10000000-0000-4000-a000-000000000004',
    '10000000-0000-4000-a000-000000000005',
    '10000000-0000-4000-a000-000000000006',
  ];

  for (const order of seedData.orders) {
    // Calculate total amount
    const totalAmount = order.items.reduce((sum, item) => {
      const product = seedData.products[item.productIndex];
      return sum + product.price * item.quantity;
    }, 0);

    const deliveryPersonId =
      order.deliveryPersonIndex !== undefined
        ? deliveryPersonUuids[order.deliveryPersonIndex]
        : null;

    const createdOrder = await prisma.order.create({
      data: {
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.deliveryAddress,
        latitude: order.latitude,
        longitude: order.longitude,
        status: order.status as any,
        totalAmount: Math.round(totalAmount * 100) / 100,
        deliveryPersonId,
        items: {
          create: order.items.map((item) => ({
            productId: productUuids[item.productIndex],
            quantity: item.quantity,
            unitPrice: seedData.products[item.productIndex].price,
          })),
        },
      },
      include: { items: true },
    });

    console.log(
      `  ✅ Order seeded: ${createdOrder.customerName} — ${createdOrder.status} (${createdOrder.items.length} items, R$ ${createdOrder.totalAmount})`,
    );
  }

  console.log(`🌱 Orders database seeded successfully! (${seedData.orders.length} orders)`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });