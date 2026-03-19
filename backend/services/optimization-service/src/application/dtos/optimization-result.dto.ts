export interface AssignmentDTO {
    orderId: string;
    deliveryPersonId: string;
    estimatedDistanceKm: number;
    orderAddress: string;
    deliveryPersonName: string;
}
  
export interface UnassignedOrderDTO {
    orderId: string;
    orderAddress: string;
    reason: string;
}
  
export interface OptimizationResultDTO {
    assignments: AssignmentDTO[];
    unassigned: UnassignedOrderDTO[];
    totalDistanceKm: number;
    algorithm: string;
    executionTimeMs: number;
}