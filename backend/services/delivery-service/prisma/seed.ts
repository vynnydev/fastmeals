import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

interface SeedDeliveryPerson {
  name: string;
  phone: string;
  vehicleType: 'bicycle' | 'motorcycle' | 'car';
  isActive: boolean;
  currentLatitude: number;
  currentLongitude: number;
}

interface SeedData {
  deliveryPersons: SeedDeliveryPerson[];
}

async function main(): Promise<void> {
  console.log('🌱 Seeding delivery persons database...');

  const dataPath = path.resolve(process.cwd(), '../../../seed/data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const seedData: SeedData = JSON.parse(rawData);

  await prisma.deliveryPerson.deleteMany();

  const created = await prisma.deliveryPerson.createMany({
    data: seedData.deliveryPersons.map((person) => ({
      name: person.name,
      phone: person.phone,
      vehicleType: person.vehicleType,
      isActive: person.isActive,
      currentLatitude: person.currentLatitude,
      currentLongitude: person.currentLongitude,
    })),
  });

  console.log(`🌱 Delivery persons database seeded successfully! (${created.count} persons)`);
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });