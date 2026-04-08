import { describe, it, expect } from 'vitest';
import {
  DeliveryPerson,
  DeliveryPersonProps,
  VehicleType,
} from '../../src/domain/entities/delivery-person.entity';

describe('DeliveryPerson Entity', () => {
  const defaultProps: DeliveryPersonProps = {
    id: 'dp-001',
    name: 'João Silva',
    phone: '11999998888',
    vehicleType: VehicleType.MOTORCYCLE,
    isActive: true,
    currentLatitude: -23.5505,
    currentLongitude: -46.6333,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  function create(overrides: Partial<DeliveryPersonProps> = {}): DeliveryPerson {
    return new DeliveryPerson({ ...defaultProps, ...overrides });
  }

  describe('getters', () => {
    it('should return id', () => {
      expect(create().id).toBe('dp-001');
    });

    it('should return name', () => {
      expect(create().name).toBe('João Silva');
    });

    it('should return phone', () => {
      expect(create().phone).toBe('11999998888');
    });

    it('should return vehicleType', () => {
      expect(create().vehicleType).toBe(VehicleType.MOTORCYCLE);
    });

    it('should return isActive', () => {
      expect(create().isActive).toBe(true);
    });

    it('should return currentLatitude', () => {
      expect(create().currentLatitude).toBe(-23.5505);
    });

    it('should return currentLongitude', () => {
      expect(create().currentLongitude).toBe(-46.6333);
    });

    it('should return null for currentLatitude when not set', () => {
      expect(create({ currentLatitude: null }).currentLatitude).toBeNull();
    });

    it('should return null for currentLongitude when not set', () => {
      expect(create({ currentLongitude: null }).currentLongitude).toBeNull();
    });

    it('should return createdAt', () => {
      expect(create().createdAt).toEqual(new Date('2026-01-01T00:00:00Z'));
    });
  });

  describe('hasLocation', () => {
    it('should return true when both lat and lng are set', () => {
      expect(create().hasLocation()).toBe(true);
    });

    it('should return false when latitude is null', () => {
      expect(create({ currentLatitude: null }).hasLocation()).toBe(false);
    });

    it('should return false when longitude is null', () => {
      expect(create({ currentLongitude: null }).hasLocation()).toBe(false);
    });

    it('should return false when both are null', () => {
      expect(create({ currentLatitude: null, currentLongitude: null }).hasLocation()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return all properties with currentOrderId as null', () => {
      const json = create().toJSON();

      expect(json).toEqual({
        ...defaultProps,
        currentOrderId: null,
      });
    });

    it('should include null coordinates in JSON', () => {
      const json = create({ currentLatitude: null, currentLongitude: null }).toJSON();

      expect(json.currentLatitude).toBeNull();
      expect(json.currentLongitude).toBeNull();
      expect(json.currentOrderId).toBeNull();
    });
  });

  describe('VehicleType enum', () => {
    it('should have BICYCLE value', () => {
      expect(VehicleType.BICYCLE).toBe('bicycle');
    });

    it('should have MOTORCYCLE value', () => {
      expect(VehicleType.MOTORCYCLE).toBe('motorcycle');
    });

    it('should have CAR value', () => {
      expect(VehicleType.CAR).toBe('car');
    });
  });
});