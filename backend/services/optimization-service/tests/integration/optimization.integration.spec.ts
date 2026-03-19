import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { OptimizationController } from '../../src/infrastructure/http/controllers/optimization.controller';
import { createOptimizationRoutes } from '../../src/infrastructure/http/routes/optimization.routes';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { OptimizeAssignmentUseCase } from '../../src/application/use-cases/optimize-assignment.use-case';
import { IOrderDataSource } from '../../src/domain/interfaces/order-data-source.interface';
import { IDeliveryDataSource } from '../../src/domain/interfaces/delivery-data-source.interface';
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

describe('Optimization Integration Tests', () => {
  let app: express.Express;
  let mockOrderDataSource: IOrderDataSource;
  let mockDeliveryDataSource: IDeliveryDataSource;

  beforeAll(() => {
    mockOrderDataSource = { getReadyOrders: vi.fn() };
    mockDeliveryDataSource = { getAvailableDeliveryPersons: vi.fn() };

    const useCase = new OptimizeAssignmentUseCase(mockOrderDataSource, mockDeliveryDataSource);
    const controller = new OptimizationController(useCase);

    app = express();
    app.use(express.json());
    app.use('/api/orders', createOptimizationRoutes(controller));
    app.use(errorHandler);
  });

  beforeEach(() => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([
      { id: 'order-1', customerName: 'João', deliveryAddress: 'Rua A, 123', latitude: -23.5891, longitude: -46.6378 },
      { id: 'order-2', customerName: 'Maria', deliveryAddress: 'Rua B, 456', latitude: -23.5632, longitude: -46.6542 },
    ]);

    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([
      { id: 'dp-1', name: 'Carlos', currentLatitude: -23.5489, currentLongitude: -46.6388 },
      { id: 'dp-2', name: 'Ana', currentLatitude: -23.5630, currentLongitude: -46.6544 },
    ]);
  });

  it('should return 200 with optimization result', async () => {
    const response = await request(app)
      .post('/api/orders/optimize-assignment')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('assignments');
    expect(response.body).toHaveProperty('unassigned');
    expect(response.body).toHaveProperty('totalDistanceKm');
    expect(response.body).toHaveProperty('algorithm', 'hungarian');
    expect(response.body).toHaveProperty('executionTimeMs');
    expect(response.body.assignments).toHaveLength(2);
  });

  it('should return 200 with empty result when no ready orders', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([]);

    const response = await request(app)
      .post('/api/orders/optimize-assignment')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.assignments).toHaveLength(0);
    expect(response.body.totalDistanceKm).toBe(0);
  });

  it('should return 403 when viewer tries to optimize', async () => {
    const response = await request(app)
      .post('/api/orders/optimize-assignment')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(403);
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/api/orders/optimize-assignment');

    expect(response.status).toBe(401);
  });

  it('should include unassigned orders when more orders than persons', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([
      { id: 'order-1', customerName: 'João', deliveryAddress: 'Rua A', latitude: -23.5891, longitude: -46.6378 },
      { id: 'order-2', customerName: 'Maria', deliveryAddress: 'Rua B', latitude: -23.5632, longitude: -46.6542 },
      { id: 'order-3', customerName: 'Pedro', deliveryAddress: 'Rua C', latitude: -23.5538, longitude: -46.6580 },
    ]);

    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([
      { id: 'dp-1', name: 'Carlos', currentLatitude: -23.5489, currentLongitude: -46.6388 },
    ]);

    const response = await request(app)
      .post('/api/orders/optimize-assignment')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.assignments).toHaveLength(1);
    expect(response.body.unassigned).toHaveLength(2);
  });
});