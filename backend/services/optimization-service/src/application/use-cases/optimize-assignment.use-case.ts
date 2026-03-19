import { IOrderDataSource, ReadyOrder } from '../../domain/interfaces/order-data-source.interface';
import {
  IDeliveryDataSource,
  AvailableDeliveryPerson,
} from '../../domain/interfaces/delivery-data-source.interface';
import { haversineDistance } from '../../domain/algorithms/haversine';
import { hungarianAlgorithm } from '../../domain/algorithms/hungarian';
import { OptimizationResultDTO } from '../dtos/optimization-result.dto';

export class OptimizeAssignmentUseCase {
  constructor(
    private readonly orderDataSource: IOrderDataSource,
    private readonly deliveryDataSource: IDeliveryDataSource,
  ) {}

  async execute(token: string): Promise<OptimizationResultDTO> {
    const startTime = Date.now();

    // 1. Fetch ready orders and available delivery persons
    const [readyOrders, availablePersons] = await Promise.all([
      this.orderDataSource.getReadyOrders(token),
      this.deliveryDataSource.getAvailableDeliveryPersons(token),
    ]);

    // 2. Edge case: no ready orders or no available delivery persons
    if (readyOrders.length === 0 || availablePersons.length === 0) {
      const executionTimeMs = Math.round(Date.now() - startTime);

      return {
        assignments: [],
        unassigned: readyOrders.map((order) => ({
          orderId: order.id,
          orderAddress: order.deliveryAddress,
          reason: availablePersons.length === 0
            ? 'No available delivery person'
            : 'No ready orders',
        })),
        totalDistanceKm: 0,
        algorithm: 'hungarian',
        executionTimeMs,
      };
    }

    // 3. Build cost matrix using Haversine distances
    // Rows = delivery persons, Cols = orders
    const costMatrix: number[][] = availablePersons.map((person) =>
      readyOrders.map((order) =>
        haversineDistance(
          person.currentLatitude,
          person.currentLongitude,
          order.latitude,
          order.longitude,
        ),
      ),
    );

    // 4. Run Hungarian Algorithm to find optimal assignment
    const result = hungarianAlgorithm(costMatrix);

    // 5. Map algorithm results to assignments and unassigned
    const assignedOrderIndices = new Set<number>();

    const assignments = result.assignments.map((assignment) => {
      const person = availablePersons[assignment.row];
      const order = readyOrders[assignment.col];

      assignedOrderIndices.add(assignment.col);

      return {
        orderId: order.id,
        deliveryPersonId: person.id,
        estimatedDistanceKm: assignment.cost,
        orderAddress: order.deliveryAddress,
        deliveryPersonName: person.name,
      };
    });

    // Orders that couldn't be assigned (more orders than delivery persons)
    const unassigned = readyOrders
      .filter((_, index) => !assignedOrderIndices.has(index))
      .map((order) => ({
        orderId: order.id,
        orderAddress: order.deliveryAddress,
        reason: 'No available delivery person',
      }));

    const executionTimeMs = Math.round(Date.now() - startTime);

    return {
      assignments,
      unassigned,
      totalDistanceKm: result.totalCost,
      algorithm: 'hungarian',
      executionTimeMs,
    };
  }
}