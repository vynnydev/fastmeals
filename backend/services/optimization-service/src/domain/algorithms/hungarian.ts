/**
 * Hungarian Algorithm (Kuhn-Munkres)
 *
 * Solves the assignment problem: given an N×M cost matrix,
 * find the assignment of workers to jobs that minimizes total cost.
 *
 * Used here to optimally assign delivery persons to orders,
 * minimizing total distance traveled.
 *
 * Time Complexity: O(n³) where n = max(workers, jobs)
 * Space Complexity: O(n²)
 *
 * Handles rectangular matrices (more orders than delivery persons or vice versa)
 * by padding with zeros to make it square.
 *
 * Reference: https://en.wikipedia.org/wiki/Hungarian_algorithm
 */

export interface AssignmentResult {
    assignments: { row: number; col: number; cost: number }[];
    totalCost: number;
  }
  
  export function hungarianAlgorithm(costMatrix: number[][]): AssignmentResult {
    if (costMatrix.length === 0 || costMatrix[0].length === 0) {
      return { assignments: [], totalCost: 0 };
    }
  
    const rows = costMatrix.length;
    const cols = costMatrix[0].length;
    const n = Math.max(rows, cols);
  
    // Pad matrix to square with zeros (dummy assignments)
    const matrix: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) =>
        i < rows && j < cols ? costMatrix[i][j] : 0,
      ),
    );
  
    // u[i] = potential for worker i, v[j] = potential for job j
    const u: number[] = new Array(n + 1).fill(0);
    const v: number[] = new Array(n + 1).fill(0);
  
    // p[j] = worker assigned to job j
    const p: number[] = new Array(n + 1).fill(0);
  
    // way[j] = previous job in alternating path for job j
    const way: number[] = new Array(n + 1).fill(0);
  
    for (let i = 1; i <= n; i++) {
      // Start finding augmenting path from worker i
      p[0] = i;
      let j0 = 0;
  
      const minv: number[] = new Array(n + 1).fill(Infinity);
      const used: boolean[] = new Array(n + 1).fill(false);
  
      do {
        used[j0] = true;
        let i0 = p[j0];
        let delta = Infinity;
        let j1 = -1;
  
        for (let j = 1; j <= n; j++) {
          if (!used[j]) {
            const cur = matrix[i0 - 1][j - 1] - u[i0] - v[j];
  
            if (cur < minv[j]) {
              minv[j] = cur;
              way[j] = j0;
            }
  
            if (minv[j] < delta) {
              delta = minv[j];
              j1 = j;
            }
          }
        }
  
        for (let j = 0; j <= n; j++) {
          if (used[j]) {
            u[p[j]] += delta;
            v[j] -= delta;
          } else {
            minv[j] -= delta;
          }
        }
  
        j0 = j1;
      } while (p[j0] !== 0);
  
      // Update assignment along augmenting path
      do {
        const j1 = way[j0];
        p[j0] = p[j1];
        j0 = j1;
      } while (j0 !== 0);
    }
  
    // Extract assignments (only real ones, not dummy padding)
    const assignments: { row: number; col: number; cost: number }[] = [];
    let totalCost = 0;
  
    for (let j = 1; j <= n; j++) {
      if (p[j] !== 0 && p[j] - 1 < rows && j - 1 < cols) {
        const row = p[j] - 1;
        const col = j - 1;
        const cost = costMatrix[row][col];
  
        assignments.push({ row, col, cost });
        totalCost += cost;
      }
    }
  
    totalCost = Math.round(totalCost * 100) / 100;
  
    return { assignments, totalCost };
}