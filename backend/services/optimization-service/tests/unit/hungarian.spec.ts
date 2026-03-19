import { describe, it, expect } from 'vitest';
import { hungarianAlgorithm } from '../../src/domain/algorithms/hungarian';

describe('Hungarian Algorithm', () => {
  it('should return empty for empty matrix', () => {
    const result = hungarianAlgorithm([]);
    expect(result.assignments).toHaveLength(0);
    expect(result.totalCost).toBe(0);
  });

  it('should handle 1x1 matrix', () => {
    const result = hungarianAlgorithm([[5]]);
    expect(result.assignments).toHaveLength(1);
    expect(result.assignments[0]).toEqual({ row: 0, col: 0, cost: 5 });
    expect(result.totalCost).toBe(5);
  });

  it('should find optimal assignment for 2x2 matrix', () => {
    // Cost matrix:
    //          Order A  Order B
    // Person 1:  1       3
    // Person 2:  3       1
    // Optimal: Person 1→A (1), Person 2→B (1) = total 2
    const result = hungarianAlgorithm([
      [1, 3],
      [3, 1],
    ]);

    expect(result.totalCost).toBe(2);
    expect(result.assignments).toHaveLength(2);
  });

  it('should find optimal assignment for 3x3 matrix', () => {
    // Classic example:
    //          Job 1  Job 2  Job 3
    // Worker 1:  1      2      3
    // Worker 2:  2      4      6
    // Worker 3:  3      6      9
    // Optimal: W1→J3(3), W2→J2(4), W3→J1(3) = total 10
    // OR: W1→J1(1), W2→J2(4), W3→J3(9) = total 14 (NOT optimal)
    const result = hungarianAlgorithm([
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9],
    ]);

    expect(result.totalCost).toBeLessThanOrEqual(10);
    expect(result.assignments).toHaveLength(3);
  });

  it('should handle rectangular matrix (more orders than persons)', () => {
    // 2 persons, 3 orders — 1 order should be unassigned
    const result = hungarianAlgorithm([
      [1, 5, 3],
      [4, 2, 6],
    ]);

    expect(result.assignments).toHaveLength(2);
  });

  it('should handle rectangular matrix (more persons than orders)', () => {
    // 3 persons, 2 orders — 1 person should be idle
    const result = hungarianAlgorithm([
      [1, 5],
      [4, 2],
      [3, 6],
    ]);

    expect(result.assignments).toHaveLength(2);
  });

  it('should find optimal even when greedy would fail', () => {
    // Greedy picks Person 1→Order A (1), then Person 2 must take Order B (10)
    // Total greedy: 11
    // Optimal: Person 1→Order B (2), Person 2→Order A (3)
    // Total optimal: 5
    const result = hungarianAlgorithm([
      [1, 2],
      [3, 10],
    ]);

    expect(result.totalCost).toBe(5);
  });

  it('should handle identical costs', () => {
    const result = hungarianAlgorithm([
      [5, 5],
      [5, 5],
    ]);

    expect(result.totalCost).toBe(10);
    expect(result.assignments).toHaveLength(2);
  });

  it('should handle zero costs', () => {
    const result = hungarianAlgorithm([
      [0, 1],
      [1, 0],
    ]);

    expect(result.totalCost).toBe(0);
  });

  it('should perform within time limit for large matrix (30x50)', () => {
    // Simulate 30 delivery persons × 50 orders
    const rows = 30;
    const cols = 50;
    const matrix = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => Math.random() * 10),
    );

    const start = performance.now();
    const result = hungarianAlgorithm(matrix);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000); // Must complete in < 2 seconds
    expect(result.assignments).toHaveLength(rows); // 30 assignments (limited by persons)
    expect(result.totalCost).toBeGreaterThan(0);
  });
});