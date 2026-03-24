import { execSync } from 'child_process';
import { APIGatewayProxyResult } from 'aws-lambda';

interface SetupEvent {
  action: 'migrate' | 'seed' | 'both';
  service: 'auth' | 'products' | 'orders' | 'delivery' | 'reports' | 'all';
}

const SERVICE_DB_ENV: Record<string, string> = {
  auth: process.env.AUTH_DATABASE_URL || '',
  products: process.env.PRODUCTS_DATABASE_URL || '',
  orders: process.env.ORDERS_DATABASE_URL || '',
  delivery: process.env.DELIVERY_DATABASE_URL || '',
  reports: process.env.REPORTS_DATABASE_URL || '',
};

export const handler = async (event: SetupEvent): Promise<APIGatewayProxyResult> => {
  const results: Record<string, string> = {};
  const services = event.service === 'all' 
    ? ['auth', 'products', 'orders', 'delivery', 'reports'] 
    : [event.service];

  for (const svc of services) {
    const dbUrl = SERVICE_DB_ENV[svc];
    if (!dbUrl) {
      results[svc] = `❌ No DATABASE_URL for ${svc}`;
      continue;
    }

    const schemaPath = `prisma/${svc}-schema.prisma`;
    
    try {
      if (event.action === 'migrate' || event.action === 'both') {
        execSync(`DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema=${schemaPath}`, { stdio: 'pipe' });
        results[`${svc}-migrate`] = '✅ Migrated';
      }

      if (event.action === 'seed' || event.action === 'both') {
        execSync(`DATABASE_URL="${dbUrl}" npx prisma db seed --schema=${schemaPath}`, { stdio: 'pipe' });
        results[`${svc}-seed`] = '✅ Seeded';
      }
    } catch (err: any) {
      results[svc] = `❌ ${err.message}`;
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ results, timestamp: new Date().toISOString() }),
  };
};