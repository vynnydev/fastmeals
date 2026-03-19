import { describe, it, expect } from 'vitest';
import { haversineDistance } from '../../src/domain/algorithms/haversine';

describe('Haversine Distance', () => {
  it('should return 0 for same point', () => {
    const distance = haversineDistance(-23.5505, -46.6333, -23.5505, -46.6333);
    expect(distance).toBe(0);
  });

  it('should calculate distance between two points in São Paulo', () => {
    // Vila Mariana to Paulista (~2.8 km)
    const distance = haversineDistance(-23.5891, -46.6378, -23.5632, -46.6542);
    expect(distance).toBeGreaterThan(2);
    expect(distance).toBeLessThan(4);
  });

  it('should calculate distance between São Paulo and Rio de Janeiro (~357 km)', () => {
    const distance = haversineDistance(-23.5505, -46.6333, -22.9068, -43.1729);
    expect(distance).toBeGreaterThan(350);
    expect(distance).toBeLessThan(370);
  });

  it('should be symmetric (A→B = B→A)', () => {
    const d1 = haversineDistance(-23.5505, -46.6333, -22.9068, -43.1729);
    const d2 = haversineDistance(-22.9068, -43.1729, -23.5505, -46.6333);
    expect(d1).toBe(d2);
  });

  it('should handle equator crossing', () => {
    const distance = haversineDistance(1, 0, -1, 0);
    expect(distance).toBeGreaterThan(200);
    expect(distance).toBeLessThan(230);
  });

  it('should handle antimeridian', () => {
    const distance = haversineDistance(0, 179, 0, -179);
    expect(distance).toBeGreaterThan(200);
    expect(distance).toBeLessThan(230);
  });

  it('should return distance in km with 2 decimal places', () => {
    const distance = haversineDistance(-23.5489, -46.6388, -23.5891, -46.6378);
    const decimalPlaces = distance.toString().split('.')[1]?.length || 0;
    expect(decimalPlaces).toBeLessThanOrEqual(2);
  });
});