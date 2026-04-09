import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Quick smoke test — validates all endpoints are responding.
 * Run: k6 run load-testing/k6-smoke.js
 */

const BASE_URL = __ENV.BASE_URL || 'https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate==0'],
  },
};

// Date range for reports (last 30 days)
function getDateRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

export default function () {
  const { startDate, endDate } = getDateRange();

  // 1. Login
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: 'admin@fastmeals.com', password: 'Admin@123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  check(loginRes, { 'login: 200': (r) => r.status === 200 });
  const token = JSON.parse(loginRes.body).accessToken;
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  sleep(0.5);

  // 2. Products
  const productsRes = http.get(`${BASE_URL}/api/products`, { headers });
  check(productsRes, { 'products: 200': (r) => r.status === 200 });

  // 3. Orders
  const ordersRes = http.get(`${BASE_URL}/api/orders`, { headers });
  check(ordersRes, { 'orders: 200': (r) => r.status === 200 });

  // 4. Delivery persons
  const deliveryRes = http.get(`${BASE_URL}/api/delivery-persons`, { headers });
  check(deliveryRes, { 'delivery: 200': (r) => r.status === 200 });

  // 5. Reports (require startDate + endDate)
  const revenueRes = http.get(`${BASE_URL}/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`, { headers });
  check(revenueRes, { 'revenue: 200': (r) => r.status === 200 });

  // 6. Optimize
  const optimizeRes = http.post(`${BASE_URL}/api/orders/optimize-assignment`, '{}', { headers });
  check(optimizeRes, { 'optimize: 2xx': (r) => r.status >= 200 && r.status < 300 });

  console.log('✅ All endpoints responding correctly');
}