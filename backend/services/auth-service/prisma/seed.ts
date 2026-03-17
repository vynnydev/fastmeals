import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();


interface SeedUser {
  email: string;
  password: string;
  role: 'admin' | 'viewer';
}

interface SeedData {
  users: SeedUser[];
}

async function main(): Promise<void> {
  console.log('🌱 Seeding auth database...');

  const dataPath = path.resolve(process.cwd(), '../../../seed/data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const seedData: SeedData = JSON.parse(rawData);

  const SALT_ROUNDS = 10;

  for (const user of seedData.users) {
    const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: hashedPassword,
        role: user.role,
      },
      create: {
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    console.log(`  ✅ User seeded: ${user.email} (${user.role})`);
  }

  console.log('🌱 Auth database seeded successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });