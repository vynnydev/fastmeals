import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { OrderController } from '../../src/infrastructure/http/controllers/order.controller';
import { createOrderRoutes } from '../../src/infrastructure/http/routes/order.routes';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { CreateOrderUseCase } from '../../src/application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../../src/application/use-cases/list-orders.use-case';
import { GetOrderUseCase } from '../../src/application/use-cases/get-order.use-case';
import { UpdateOrderStatusUseCase } from '../../src/application/use-cases/update-order-status.use-case';
import { AssignDeliveryPersonUseCase } from '../../src/application/use-cases/assign-delivery-person.use-case';
import { IOrderRepository } from '../../src/domain/repositories/order-repository.interface';
import { IProductClient } from '../../src/application/interfaces/product-client.interface';
import { IDeliveryClient } from '../../src/application/interfaces/delivery-client.interface';
import { Order } from '../../src/domain/entities/order.entity';
import { OrderItem } from '../../src/domain/entities/order-item.entity';
import { OrderStatus } from '../../src/domain/value-objects/order-status.vo';
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

const ORDER_UUID = '550e8400-e29b-41d4-a716-446655440010';
const PRODUCT_UUID_1 = '550e8400-e29b-41d4-a716-446655440020';
const PRODUCT_UUID_2 = '550e8400-e29b-41d4-a716-446655440021';
const DELIVERY_PERSON_UUID = '550e8400-e29b-41d4-a716-446655440030';

describe('Orders Integration Tests', () => {
  let app: express.Express;
  let mockRepository: IOrderRepository;
  let mockProductClient: IProductClient;
  let mockDeliveryClient: IDeliveryClient;

  const createMockOrder = (
    status: OrderStatus = OrderStatus.PENDING,
    deliveryPersonId: string | null = null,
  ): Order => {
    return new Order({
      id: ORDER_UUID,
      customerName: 'João Silva',
      customerPhone: '(11) 99999-1234',
      deliveryAddress: 'Rua das Flores, 123, Vila Mariana, São Paulo - SP',
      latitude: -23.5891,
      longitude: -46.6378,
      status,
      totalAmount: 78.30,
      deliveryPersonId,
      items: [
        new OrderItem({
          id: '550e8400-e29b-41d4-a716-446655440040',
          orderId: ORDER_UUID,
          productId: PRODUCT_UUID_1,
          quantity: 2,
          unitPrice: 32.90,
          createdAt: new Date('2026-01-20T14:30:00Z'),
        }),
        new OrderItem({
          id: '550e8400-e29b-41d4-a716-446655440041',
          orderId: ORDER_UUID,
          productId: PRODUCT_UUID_2,
          quantity: 1,
          unitPrice: 12.50,
          createdAt: new Date('2026-01-20T14:30:00Z'),
        }),
      ],
      createdAt: new Date('2026-01-20T14:30:00Z'),
      updatedAt: new Date('2026-01-20T14:30:00Z'),
    });
  };

  beforeAll(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
      assignDeliveryPerson: vi.fn(),
      findByStatus: vi.fn(),
      hasProductInActiveOrders: vi.fn(),
    };

    mockProductClient = {
      getProductById: vi.fn(),
      getProductsByIds: vi.fn(),
    };

    mockDeliveryClient = {
      getDeliveryPersonById: vi.fn(),
      isDeliveryPersonAvailable: vi.fn(),
    };

    // Use cases WITHOUT event publisher (not needed for tests)
    const createOrderUseCase = new CreateOrderUseCase(mockRepository, mockProductClient);
    const listOrdersUseCase = new ListOrdersUseCase(mockRepository);
    const getOrderUseCase = new GetOrderUseCase(mockRepository);
    const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(mockRepository);
    const assignDeliveryPersonUseCase = new AssignDeliveryPersonUseCase(mockRepository, mockDeliveryClient);

    const controller = new OrderController(
      createOrderUseCase,
      listOrdersUseCase,
      getOrderUseCase,
      updateOrderStatusUseCase,
      assignDeliveryPersonUseCase,
    );

    app = express();
    app.use(express.json());
    app.use('/api/orders', createOrderRoutes(controller));
    app.use(errorHandler);
  });

  beforeEach(() => {
    const pendingOrder = createMockOrder(OrderStatus.PENDING);

    vi.mocked(mockRepository.findById).mockResolvedValue(pendingOrder);
    vi.mocked(mockRepository.findAll).mockResolvedValue({
      data: [pendingOrder],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    vi.mocked(mockRepository.create).mockResolvedValue(pendingOrder);
    vi.mocked(mockRepository.updateStatus).mockImplementation(async (_id, status) => {
      return createMockOrder(status);
    });
    vi.mocked(mockRepository.assignDeliveryPerson).mockResolvedValue(
      createMockOrder(OrderStatus.PENDING, DELIVERY_PERSON_UUID),
    );

    vi.mocked(mockProductClient.getProductsByIds).mockResolvedValue([
      { id: PRODUCT_UUID_1, name: 'X-Burger', price: 32.90, isAvailable: true },
      { id: PRODUCT_UUID_2, name: 'Suco de Laranja', price: 12.50, isAvailable: true },
    ]);

    vi.mocked(mockDeliveryClient.getDeliveryPersonById).mockResolvedValue({
      id: DELIVERY_PERSON_UUID,
      name: 'Carlos Santos',
      isActive: true,
      currentOrderId: null,
    });
    vi.mocked(mockDeliveryClient.isDeliveryPersonAvailable).mockResolvedValue(true);
  });

  // ──────────────────────────────────
  // GET /api/orders
  // ──────────────────────────────────

  describe('GET /api/orders', () => {
    it('should return 200 with paginated orders for admin', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].customerName).toBe('João Silva');
      expect(response.body.data[0].items).toHaveLength(2);
    });

    it('should return 200 for viewer (read access)', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/orders');

      expect(response.status).toBe(401);
    });
  });

  // ──────────────────────────────────
  // GET /api/orders/:id
  // ──────────────────────────────────

  describe('GET /api/orders/:id', () => {
    it('should return 200 with order details including items', async () => {
      const response = await request(app)
        .get(`/api/orders/${ORDER_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(ORDER_UUID);
      expect(response.body.customerName).toBe('João Silva');
      expect(response.body.totalAmount).toBe(78.30);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0]).toHaveProperty('unitPrice');
      expect(response.body.items[0]).toHaveProperty('subtotal');
    });

    it('should return 404 for nonexistent order', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/orders/550e8400-e29b-41d4-a716-446655440099')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('ORDER_NOT_FOUND');
    });
  });

  // ──────────────────────────────────
  // POST /api/orders
  // ──────────────────────────────────

  describe('POST /api/orders', () => {
    it('should return 201 when admin creates an order', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'João Silva',
          customerPhone: '(11) 99999-1234',
          deliveryAddress: 'Rua das Flores, 123, Vila Mariana, São Paulo - SP',
          latitude: -23.5891,
          longitude: -46.6378,
          items: [
            { productId: PRODUCT_UUID_1, quantity: 2 },
            { productId: PRODUCT_UUID_2, quantity: 1 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');
      expect(response.body.items).toHaveLength(2);
    });

    it('should return 403 when viewer tries to create', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          customerName: 'Maria',
          customerPhone: '(11) 98888-5678',
          deliveryAddress: 'Av. Paulista, 1000, São Paulo - SP',
          latitude: -23.5632,
          longitude: -46.6542,
          items: [{ productId: PRODUCT_UUID_1, quantity: 1 }],
        });

      expect(response.status).toBe(403);
    });

    it('should return 400 with invalid phone format', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'João Silva',
          customerPhone: '11999991234',
          deliveryAddress: 'Rua das Flores, 123, Vila Mariana, São Paulo - SP',
          latitude: -23.5891,
          longitude: -46.6378,
          items: [{ productId: PRODUCT_UUID_1, quantity: 1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when items array is empty', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'João Silva',
          customerPhone: '(11) 99999-1234',
          deliveryAddress: 'Rua das Flores, 123, Vila Mariana, São Paulo - SP',
          latitude: -23.5891,
          longitude: -46.6378,
          items: [],
        });

      expect(response.status).toBe(400);
    });

    it('should return 422 when product is unavailable', async () => {
      vi.mocked(mockProductClient.getProductsByIds).mockResolvedValueOnce([
        { id: PRODUCT_UUID_1, name: 'X-Burger', price: 32.90, isAvailable: false },
      ]);

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerName: 'João Silva',
          customerPhone: '(11) 99999-1234',
          deliveryAddress: 'Rua das Flores, 123, Vila Mariana, São Paulo - SP',
          latitude: -23.5891,
          longitude: -46.6378,
          items: [{ productId: PRODUCT_UUID_1, quantity: 1 }],
        });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('UNAVAILABLE_PRODUCT');
    });
  });

  // ──────────────────────────────────
  // PATCH /api/orders/:id/status
  // ──────────────────────────────────

  describe('PATCH /api/orders/:id/status', () => {
    it('should return 200 for valid transition pending → preparing', async () => {
      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'preparing' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('preparing');
    });

    it('should return 422 for invalid transition pending → delivered', async () => {
      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivered' });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('should return 422 for ready → delivering without delivery person', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(
        createMockOrder(OrderStatus.READY, null),
      );

      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivering' });

      expect(response.status).toBe(422);
    });

    it('should return 200 for ready → delivering with delivery person', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(
        createMockOrder(OrderStatus.READY, DELIVERY_PERSON_UUID),
      );

      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'delivering' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('delivering');
    });

    it('should return 403 when viewer tries to update status', async () => {
      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/status`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ status: 'preparing' });

      expect(response.status).toBe(403);
    });
  });

  // ──────────────────────────────────
  // PATCH /api/orders/:id/assign
  // ──────────────────────────────────

  describe('PATCH /api/orders/:id/assign', () => {
    it('should return 200 when assigning available delivery person', async () => {
      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ deliveryPersonId: DELIVERY_PERSON_UUID });

      expect(response.status).toBe(200);
      expect(response.body.deliveryPersonId).toBe(DELIVERY_PERSON_UUID);
    });

    it('should return 404 when delivery person not found', async () => {
      vi.mocked(mockDeliveryClient.getDeliveryPersonById).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ deliveryPersonId: '550e8400-e29b-41d4-a716-446655440099' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('DELIVERY_PERSON_NOT_FOUND');
    });

    it('should return 422 when delivery person is unavailable', async () => {
      vi.mocked(mockDeliveryClient.getDeliveryPersonById).mockResolvedValueOnce({
        id: DELIVERY_PERSON_UUID,
        name: 'Carlos Santos',
        isActive: true,
        currentOrderId: null,
      });
      vi.mocked(mockDeliveryClient.isDeliveryPersonAvailable).mockResolvedValueOnce(false);

      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ deliveryPersonId: DELIVERY_PERSON_UUID });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe('DELIVERY_PERSON_UNAVAILABLE');
    });

    it('should return 403 when viewer tries to assign', async () => {
      const response = await request(app)
        .patch(`/api/orders/${ORDER_UUID}/assign`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ deliveryPersonId: DELIVERY_PERSON_UUID });

      expect(response.status).toBe(403);
    });
  });
});