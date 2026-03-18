import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { ProductController } from '../../src/infrastructure/http/controllers/product.controller';
import { createProductRoutes } from '../../src/infrastructure/http/routes/product.routes';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { CreateProductUseCase } from '../../src/application/use-cases/create-product.use-case';
import { UpdateProductUseCase } from '../../src/application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../src/application/use-cases/delete-product.use-case';
import { GetProductUseCase } from '../../src/application/use-cases/get-product.use-case';
import { ListProductsUseCase } from '../../src/application/use-cases/list-products.use-case';
import { IProductRepository } from '../../src/domain/repositories/product-repository.interface';
import { Product, ProductCategory } from '../../src/domain/entities/product.entity';
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

// UUID real para usar nos testes
const PRODUCT_UUID = '550e8400-e29b-41d4-a716-446655440099';

describe('Products Integration Tests', () => {
  let app: express.Express;
  let mockRepository: IProductRepository;

  const mockProduct = new Product({
    id: PRODUCT_UUID,
    name: 'X-Burger Especial',
    description: 'Hamburguer artesanal com queijo cheddar, bacon e alface',
    price: 32.90,
    category: ProductCategory.MEAL,
    imageUrl: 'https://example.com/burger.jpg',
    isAvailable: true,
    preparationTime: 25,
    createdAt: new Date('2026-01-15T10:30:00Z'),
    updatedAt: new Date('2026-01-15T10:30:00Z'),
  });

  beforeAll(() => {
    mockRepository = {
      findById: vi.fn().mockResolvedValue(mockProduct),
      findAll: vi.fn().mockResolvedValue({
        data: [mockProduct],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
      create: vi.fn().mockResolvedValue(mockProduct),
      update: vi.fn().mockResolvedValue(mockProduct),
      delete: vi.fn().mockResolvedValue(undefined),
      hasActiveOrders: vi.fn().mockResolvedValue(false),
    };

    const createUseCase = new CreateProductUseCase(mockRepository);
    const updateUseCase = new UpdateProductUseCase(mockRepository);
    const deleteUseCase = new DeleteProductUseCase(mockRepository);
    const getUseCase = new GetProductUseCase(mockRepository);
    const listUseCase = new ListProductsUseCase(mockRepository);

    const controller = new ProductController(
      createUseCase,
      updateUseCase,
      deleteUseCase,
      getUseCase,
      listUseCase,
    );

    app = express();
    app.use(express.json());
    app.use('/api/products', createProductRoutes(controller));
    app.use(errorHandler);
  });

  beforeEach(() => {
    // Reset mocks to default state before each test
    vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockRepository.findAll).mockResolvedValue({
      data: [mockProduct],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    vi.mocked(mockRepository.create).mockResolvedValue(mockProduct);
    vi.mocked(mockRepository.update).mockResolvedValue(mockProduct);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockRepository.hasActiveOrders).mockResolvedValue(false);
  });

  describe('GET /api/products', () => {
    it('should return 200 with paginated products for admin', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });

    it('should return 200 for viewer (read access)', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 200 with product details', async () => {
      const response = await request(app)
        .get(`/api/products/${PRODUCT_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('X-Burger Especial');
      expect(response.body.price).toBe(32.90);
    });

    it('should return 404 for nonexistent product', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/products/550e8400-e29b-41d4-a716-446655440088')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });

  describe('POST /api/products', () => {
    it('should return 201 when admin creates a product', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'X-Burger Especial',
          description: 'Hamburguer artesanal com queijo cheddar, bacon e alface',
          price: 32.90,
          category: 'meal',
          imageUrl: 'https://example.com/burger.jpg',
          preparationTime: 25,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('X-Burger Especial');
    });

    it('should return 403 when viewer tries to create', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Suco de Laranja',
          description: 'Suco natural feito na hora sem açúcar',
          price: 12.50,
          category: 'drink',
          preparationTime: 5,
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 on invalid product data', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'AB',
          price: -10,
          category: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should return 200 when admin updates a product', async () => {
      const response = await request(app)
        .put(`/api/products/${PRODUCT_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 35.90,
          isAvailable: false,
        });

      expect(response.status).toBe(200);
    });

    it('should return 403 when viewer tries to update', async () => {
      const response = await request(app)
        .put(`/api/products/${PRODUCT_UUID}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ price: 35.90 });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should return 204 when admin deletes a product', async () => {
      const response = await request(app)
        .delete(`/api/products/${PRODUCT_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 403 when viewer tries to delete', async () => {
      const response = await request(app)
        .delete(`/api/products/${PRODUCT_UUID}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 409 when product has active orders', async () => {
      vi.mocked(mockRepository.hasActiveOrders).mockResolvedValue(true);

      const response = await request(app)
        .delete(`/api/products/${PRODUCT_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('PRODUCT_IN_USE');
    });
  });
});