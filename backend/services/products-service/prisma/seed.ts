import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  category: 'meal' | 'drink' | 'dessert' | 'side';
  imageUrl: string;
  isAvailable: boolean;
  preparationTime: number;
}

interface SeedData {
  products: SeedProduct[];
}

async function main(): Promise<void> {
  console.log('🌱 Seeding products database...');

  const dataPath = path.resolve(process.cwd(), '../../../seed/data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const seedData: SeedData = JSON.parse(rawData);

  // Clear existing products to avoid duplicates on re-seed
  await prisma.product.deleteMany();

  const created = await prisma.product.createMany({
    data: seedData.products.map((product) => ({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      preparationTime: product.preparationTime,
    })),
  });

  console.log(`🌱 Products database seeded successfully! (${created.count} products)`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });