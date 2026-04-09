import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ==========================================
// Custom metrics
// ==========================================
const errorRate = new Rate('errors');
const listProductsDuration = new Trend('list_products_duration', true);
const listOrdersDuration = new Trend('list_orders_duration', true);
const optimizeDuration = new Trend('optimize_duration', true);
const reportsDuration = new Trend('reports_duration', true);
const deliveryDuration = new Trend('delivery_duration', true);

// ==========================================
// Configuration
// ==========================================
const BASE_URL = __ENV.BASE_URL || 'https://t2fwiydcrc.execute-api.us-east-1.amazonaws.com';

const ADMIN_USER = {
  email: 'admin@fastmeals.com',
  password: 'Admin@123',
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

// ==========================================
// Setup: Login once, share token across VUs
// ==========================================
export function setup() {
  const res = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify(ADMIN_USER),
    { headers: { 'Content-Type': 'application/json' } },
  );

  const success = check(res, {
    'setup login: status 200': (r) => r.status === 200,
  });

  if (!success) {
    console.error('❌ Setup login failed! Aborting test.');
    return { token: null };
  }

  const token = JSON.parse(res.body).accessToken;
  console.log('✅ Setup: login successful, token shared across all VUs');
  return { token };
}

// ==========================================
// Scenarios
// ==========================================
export const options = {
  scenarios: {
    // Smoke test: 1 user, quick validation
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { scenario: 'smoke' },
      exec: 'smokeTest',
    },

    // Load test: gradual ramp to 10 users
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: 'load' },
      exec: 'loadTest',
      startTime: '35s',
    },

    // Stress test: push to 20 users (realistic for serverless)
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario: 'stress' },
      exec: 'stressTest',
      startTime: '3m10s',
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% of requests under 3s
    http_req_failed: ['rate<0.10'],      // Error rate under 10%
    errors: ['rate<0.10'],               // Custom error rate under 10%
  },
};

// ==========================================
// Helper: Authenticated GET
// ==========================================
function authGet(url, token, metricTrend) {
  const res = http.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (metricTrend) metricTrend.add(res.timings.duration);

  const success = check(res, {
    'status 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
  return res;
}

// ==========================================
// Helper: Authenticated POST
// ==========================================
function authPost(url, body, token, metricTrend) {
  const res = http.post(url, JSON.stringify(body), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (metricTrend) metricTrend.add(res.timings.duration);

  const success = check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  errorRate.add(!success);
  return res;
}

// ==========================================
// Smoke Test: Basic validation
// ==========================================
export function smokeTest(data) {
  if (!data.token) return;
  const { startDate, endDate } = getDateRange();

  group('Smoke Test', () => {
    authGet(`${BASE_URL}/api/products`, data.token, listProductsDuration);
    sleep(1);

    authGet(`${BASE_URL}/api/orders`, data.token, listOrdersDuration);
    sleep(1);

    authGet(`${BASE_URL}/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`, data.token, reportsDuration);
    sleep(1);
  });
}

// ==========================================
// Load Test: Normal traffic patterns
// ==========================================
export function loadTest(data) {
  if (!data.token) return;
  const { startDate, endDate } = getDateRange();

  group('Load Test', () => {
    // Browse products (most common action)
    authGet(`${BASE_URL}/api/products`, data.token, listProductsDuration);
    sleep(0.5);

    // List orders
    authGet(`${BASE_URL}/api/orders`, data.token, listOrdersDuration);
    sleep(0.5);

    // Check delivery persons
    authGet(`${BASE_URL}/api/delivery-persons`, data.token, deliveryDuration);
    sleep(0.5);

    // Reports
    authGet(`${BASE_URL}/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`, data.token, reportsDuration);
    sleep(0.5);

    // Optimize assignment
    authPost(`${BASE_URL}/api/orders/optimize-assignment`, {}, data.token, optimizeDuration);
    sleep(1);
  });
}

// ==========================================
// Stress Test: High traffic
// ==========================================
export function stressTest(data) {
  if (!data.token) return;
  const { startDate, endDate } = getDateRange();

  group('Stress Test', () => {
    // Rapid-fire reads
    authGet(`${BASE_URL}/api/products`, data.token, listProductsDuration);
    authGet(`${BASE_URL}/api/orders`, data.token, listOrdersDuration);
    authGet(`${BASE_URL}/api/delivery-persons`, data.token, deliveryDuration);
    sleep(0.3);

    // Reports under load
    authGet(`${BASE_URL}/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`, data.token, reportsDuration);
    sleep(0.3);

    // Optimize (heavy computation)
    authPost(`${BASE_URL}/api/orders/optimize-assignment`, {}, data.token, optimizeDuration);
    sleep(0.5);
  });
}

// ==========================================
// Summary handler
// ==========================================
export function handleSummary(data) {
  const metrics = data.metrics || {};

  const getValue = (metric, key) => {
    try {
      const val = metrics[metric].values[key];
      return val !== undefined && val !== null ? val : null;
    } catch {
      return null;
    }
  };

  const formatMs = (val) => (val != null && typeof val === 'number') ? val.toFixed(2) + 'ms' : 'N/A';
  const formatPct = (val) => (val != null && typeof val === 'number') ? (val * 100).toFixed(2) + '%' : 'N/A';

  const summary = {
    timestamp: new Date().toISOString(),
    scenarios: {
      smoke: '1 VU, 30s',
      load: '0→5→10→0 VUs, 2m',
      stress: '0→10→20→0 VUs, 2m',
    },
    results: {
      total_requests: getValue('http_reqs', 'count') || 0,
      avg_duration: formatMs(getValue('http_req_duration', 'avg')),
      p95_duration: formatMs(getValue('http_req_duration', 'p(95)')),
      p99_duration: formatMs(getValue('http_req_duration', 'p(99)')),
      error_rate: formatPct(getValue('http_req_failed', 'rate')),
    },
    per_endpoint: {
      products_p95: formatMs(getValue('list_products_duration', 'p(95)')),
      orders_p95: formatMs(getValue('list_orders_duration', 'p(95)')),
      delivery_p95: formatMs(getValue('delivery_duration', 'p(95)')),
      optimize_p95: formatMs(getValue('optimize_duration', 'p(95)')),
      reports_p95: formatMs(getValue('reports_duration', 'p(95)')),
    },
  };

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-testing/results/summary.json': JSON.stringify(summary, null, 2),
  };
}

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';