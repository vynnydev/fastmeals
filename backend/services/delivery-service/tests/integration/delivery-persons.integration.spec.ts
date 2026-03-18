import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { DeliveryPersonController } from '../../src/infrastructure/http/controllers/delivery-person.controller';
import { createDeliveryPersonRoutes } from '../../src/infrastructure/http/routes/delivery-person.routes';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { CreateDeliveryPersonUseCase } from '../../src/application/use-cases/create-delivery-person.use-case';
import { UpdateDeliveryPersonUseCase } from '../../src/application/use-cases/update-delivery-person.use-case';
import { DeleteDeliveryPersonUseCase } from '../../src/application/use-cases/delete-delivery-person.use-case';
import { GetDeliveryPersonUseCase } from '../../src/application/use-cases/get-delivery-person.use-case';
import { ListDeliveryPersonsUseCase } from '../../src/application/use-cases/list-delivery-persons.use-case';
import { IDeliveryPersonRepository } from '../../src/domain/repositories/delivery-person-repository.interface';
import { DeliveryPerson, VehicleType } from '../../src/domain/entities/delivery-person.entity';
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

const PERSON_UUID = '550e8400-e29b-41d4-a716-446655440050';

describe('Delivery Persons Integration Tests', () => {
  let app: express.Express;
  let mockRepository: IDeliveryPersonRepository;

  const mockPerson = new DeliveryPerson({
    id: PERSON_UUID,
    name: 'Carlos Santos',
    phone: '(11) 91234-5678',
    vehicleType: VehicleType.MOTORCYCLE,
    isActive: true,
    currentLatitude: -23.5489,
    currentLongitude: -46.6388,
    createdAt: new Date(),
  });

  beforeAll(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findActiveWithoutDeliveringOrder: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      isAssignedToDeliveringOrder: vi.fn(),
    };

    const createUseCase = new CreateDeliveryPersonUseCase(mockRepository);
    const updateUseCase = new UpdateDeliveryPersonUseCase(mockRepository);
    const deleteUseCase = new DeleteDeliveryPersonUseCase(mockRepository);
    const getUseCase = new GetDeliveryPersonUseCase(mockRepository);
    const listUseCase = new ListDeliveryPersonsUseCase(mockRepository);

    const controller = new DeliveryPersonController(
      createUseCase,
      updateUseCase,
      deleteUseCase,
      getUseCase,
      listUseCase,
    );

    app = express();
    app.use(express.json());
    app.use('/api/delivery-persons', createDeliveryPersonRoutes(controller));
    app.use(errorHandler);
  });

  beforeEach(() => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockPerson);
    vi.mocked(mockRepository.findAll).mockResolvedValue([mockPerson]);
    vi.mocked(mockRepository.findActiveWithoutDeliveringOrder).mockResolvedValue([mockPerson]);
    vi.mocked(mockRepository.create).mockResolvedValue(mockPerson);
    vi.mocked(mockRepository.update).mockResolvedValue(mockPerson);
    vi.mocked(mockRepository.delete).mockResolvedValue(undefined);
    vi.mocked(mockRepository.isAssignedToDeliveringOrder).mockResolvedValue(false);
  });

  describe('GET /api/delivery-persons', () => {
    it('should return 200 with list for admin', async () => {
      const response = await request(app)
        .get('/api/delivery-persons')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Carlos Santos');
    });

    it('should return 200 for viewer', async () => {
      const response = await request(app)
        .get('/api/delivery-persons')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(200);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/delivery-persons');

      expect(response.status).toBe(401);
    });

    it('should filter available delivery persons', async () => {
      const response = await request(app)
        .get('/api/delivery-persons?available=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(mockRepository.findActiveWithoutDeliveringOrder).toHaveBeenCalled();
    });
  });

  describe('GET /api/delivery-persons/:id', () => {
    it('should return 200 with delivery person details', async () => {
      const response = await request(app)
        .get(`/api/delivery-persons/${PERSON_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Carlos Santos');
      expect(response.body.vehicleType).toBe('motorcycle');
    });

    it('should return 404 when not found', async () => {
      vi.mocked(mockRepository.findById).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/delivery-persons/550e8400-e29b-41d4-a716-446655440099')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('DELIVERY_PERSON_NOT_FOUND');
    });
  });

  describe('POST /api/delivery-persons', () => {
    it('should return 201 when admin creates', async () => {
      const response = await request(app)
        .post('/api/delivery-persons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Carlos Santos',
          phone: '(11) 91234-5678',
          vehicleType: 'motorcycle',
          currentLatitude: -23.5489,
          currentLongitude: -46.6388,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Carlos Santos');
    });

    it('should return 403 when viewer tries to create', async () => {
      const response = await request(app)
        .post('/api/delivery-persons')
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({
          name: 'Ana Ferreira',
          phone: '(11) 92345-6789',
          vehicleType: 'bicycle',
        });

      expect(response.status).toBe(403);
    });

    it('should return 400 with invalid vehicle type', async () => {
      const response = await request(app)
        .post('/api/delivery-persons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Roberto Lima',
          phone: '(11) 93456-7890',
          vehicleType: 'airplane',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 with invalid phone format', async () => {
      const response = await request(app)
        .post('/api/delivery-persons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Roberto Lima',
          phone: '11934567890',
          vehicleType: 'motorcycle',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/delivery-persons/:id', () => {
    it('should return 200 when admin updates', async () => {
      const response = await request(app)
        .put(`/api/delivery-persons/${PERSON_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
    });

    it('should return 403 when viewer tries to update', async () => {
      const response = await request(app)
        .put(`/api/delivery-persons/${PERSON_UUID}`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/delivery-persons/:id', () => {
    it('should return 204 when admin deletes', async () => {
      const response = await request(app)
        .delete(`/api/delivery-persons/${PERSON_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 403 when viewer tries to delete', async () => {
      const response = await request(app)
        .delete(`/api/delivery-persons/${PERSON_UUID}`)
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 409 when assigned to delivering order', async () => {
      vi.mocked(mockRepository.isAssignedToDeliveringOrder).mockResolvedValue(true);

      const response = await request(app)
        .delete(`/api/delivery-persons/${PERSON_UUID}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('DELIVERY_PERSON_IN_USE');
    });
  });
});