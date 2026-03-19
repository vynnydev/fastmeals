import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ReportController } from '../../src/infrastructure/http/controllers/report.controller';
import { createReportRoutes } from '../../src/infrastructure/http/routes/report.routes';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { GetRevenueUseCase } from '../../src/application/use-cases/get-revenue.use-case';
import { GetOrdersByStatusUseCase } from '../../src/application/use-cases/get-orders-by-status.use-case';
import { GetTopProductsUseCase } from '../../src/application/use-cases/get-top-products.use-case';
import { GetAvgDeliveryTimeUseCase } from '../../src/application/use-cases/get-avg-delivery-time.use-case';
import { GetAIInsightsUseCase } from '../../src/application/use-cases/get-ai-insights.use-case';
import { IReportRepository } from '../../src/domain/repositories/report-repository.interface';
import { IAIService } from '../../src/application/interfaces/ai-service.interface';
import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-access-secret-at-least-10-chars';
const adminToken = jwt.sign(
  { userId: '550e8400-e29b-41d4-a716-446655440000', email: 'admin@fastmeals.com', role: 'admin' },
  TEST_SECRET,
  { issuer: 'fastmeals-auth-service', expiresIn: '15m' },
);
const viewerToken = jwt.sign(
  { userId: '550e8400-e29b-41d4-a716-446655440001', email: 'viewer@fastmeals.com', role: 'viewer' },
  TEST_SECRET,
  { issuer: 'fastmeals-auth-service', expiresIn: '15m' },
);

describe('Reports Integration Tests', () => {
  let app: express.Express;
  let mockRepository: IReportRepository;
  let mockAIService: IAIService;

  beforeAll(() => {
    mockRepository = {
      getRevenue: vi.fn(),
      getOrdersByStatus: vi.fn(),
      getTopProducts: vi.fn(),
      getAverageDeliveryTime: vi.fn(),
    };

    mockAIService = {
      generateInsights: vi.fn().mockResolvedValue({
        summary: 'AI analysis.',
        recommendations: ['Rec 1'],
        highlights: ['Highlight 1'],
        generatedAt: new Date().toISOString(),
        model: 'test-model',
      }),
    };

    const revenueUC = new GetRevenueUseCase(mockRepository);
    const statusUC = new GetOrdersByStatusUseCase(mockRepository);
    const topUC = new GetTopProductsUseCase(mockRepository);
    const deliveryUC = new GetAvgDeliveryTimeUseCase(mockRepository);
    const aiUC = new GetAIInsightsUseCase(mockRepository, mockAIService);

    const controller = new ReportController(revenueUC, statusUC, topUC, deliveryUC, aiUC);

    app = express();
    app.use(express.json());
    app.use('/api/reports', createReportRoutes(controller));
    app.use(errorHandler);
  });

  beforeEach(() => {
    vi.mocked(mockRepository.getRevenue).mockResolvedValue({
      startDate: '2026-01-01', endDate: '2026-01-31',
      totalRevenue: 15420.50, totalOrders: 312, averageOrderValue: 49.42,
      dailyRevenue: [{ date: '2026-01-01', revenue: 520, orders: 12 }],
    });
    vi.mocked(mockRepository.getOrdersByStatus).mockResolvedValue({
      data: [{ status: 'delivered', count: 284 }, { status: 'pending', count: 15 }],
      total: 340,
    });
    vi.mocked(mockRepository.getTopProducts).mockResolvedValue({
      data: [{ productId: 'p1', productName: 'X-Burger', totalQuantity: 156, totalRevenue: 5134.40 }],
    });
    vi.mocked(mockRepository.getAverageDeliveryTime).mockResolvedValue({
      averageMinutes: 42.5, fastestMinutes: 18, slowestMinutes: 87,
      totalDelivered: 284, byVehicleType: [{ vehicleType: 'motorcycle', averageMinutes: 35.2, count: 180 }],
    });
  });

  describe('GET /api/reports/revenue', () => {
    it('should return 200 with revenue report', async () => {
      const res = await request(app)
        .get('/api/reports/revenue?startDate=2026-01-01&endDate=2026-01-31')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalRevenue).toBe(15420.50);
      expect(res.body.totalOrders).toBe(312);
      expect(res.body.dailyRevenue).toHaveLength(1);
    });

    it('should return 200 for viewer', async () => {
      const res = await request(app)
        .get('/api/reports/revenue?startDate=2026-01-01&endDate=2026-01-31')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 400 without required dates', async () => {
      const res = await request(app)
        .get('/api/reports/revenue')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/reports/revenue?startDate=2026-01-01&endDate=2026-01-31');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/reports/orders-by-status', () => {
    it('should return 200 with orders grouped by status', async () => {
      const res = await request(app)
        .get('/api/reports/orders-by-status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.total).toBe(340);
    });
  });

  describe('GET /api/reports/top-products', () => {
    it('should return 200 with top products', async () => {
      const res = await request(app)
        .get('/api/reports/top-products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].productName).toBe('X-Burger');
    });

    it('should accept date range and limit', async () => {
      const res = await request(app)
        .get('/api/reports/top-products?startDate=2026-01-01&endDate=2026-01-31&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/reports/average-delivery-time', () => {
    it('should return 200 with delivery time stats', async () => {
      const res = await request(app)
        .get('/api/reports/average-delivery-time')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.averageMinutes).toBe(42.5);
      expect(res.body.fastestMinutes).toBe(18);
      expect(res.body.slowestMinutes).toBe(87);
      expect(res.body.byVehicleType).toHaveLength(1);
    });
  });

  describe('GET /api/reports/ai-insights', () => {
    it('should return 200 with AI-generated insights', async () => {
      // Ensure all repository mocks are set for this test
      vi.mocked(mockRepository.getRevenue).mockResolvedValue({
        startDate: '2026-01-01', endDate: '2026-01-31',
        totalRevenue: 15420.50, totalOrders: 312, averageOrderValue: 49.42,
        dailyRevenue: [],
      });
      vi.mocked(mockRepository.getOrdersByStatus).mockResolvedValue({
        data: [{ status: 'delivered', count: 284 }], total: 340,
      });
      vi.mocked(mockRepository.getTopProducts).mockResolvedValue({
        data: [{ productId: 'p1', productName: 'X-Burger', totalQuantity: 156, totalRevenue: 5134.40 }],
      });
      vi.mocked(mockRepository.getAverageDeliveryTime).mockResolvedValue({
        averageMinutes: 42.5, fastestMinutes: 18, slowestMinutes: 87,
        totalDelivered: 284, byVehicleType: [],
      });
      vi.mocked(mockAIService.generateInsights).mockResolvedValue({
        summary: 'AI analysis.',
        recommendations: ['Rec 1'],
        highlights: ['Highlight 1'],
        generatedAt: new Date().toISOString(),
        model: 'test-model',
      });
  
      const res = await request(app)
        .get('/api/reports/ai-insights?startDate=2026-01-01&endDate=2026-01-31')
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
      expect(res.body).toHaveProperty('recommendations');
      expect(res.body).toHaveProperty('highlights');
      expect(res.body).toHaveProperty('model');
    });

    it('should return 400 without required dates', async () => {
      const res = await request(app)
        .get('/api/reports/ai-insights')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });
});