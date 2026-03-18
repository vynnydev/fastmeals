import { Request, Response, NextFunction } from 'express';
import { CreateOrderUseCase } from '../../../application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../../../application/use-cases/list-orders.use-case';
import { GetOrderUseCase } from '../../../application/use-cases/get-order.use-case';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/update-order-status.use-case';
import { AssignDeliveryPersonUseCase } from '../../../application/use-cases/assign-delivery-person.use-case';
import {
  createOrderSchema,
  listOrdersQuerySchema,
  orderIdSchema,
  updateOrderStatusSchema,
  assignDeliveryPersonSchema,
} from '../validators/order.validator';

export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase,
    private readonly assignDeliveryPersonUseCase: AssignDeliveryPersonUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createOrderSchema.parse(req.body);

      // Extract token to forward to products-service
      const token = req.headers.authorization?.split(' ')[1] || '';

      const order = await this.createOrderUseCase.execute(validated, token);

      res.status(201).json(order.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listOrdersQuerySchema.parse(req.query);

      const result = await this.listOrdersUseCase.execute({
        page: query.page,
        limit: query.limit,
        status: query.status,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      res.status(200).json({
        data: result.data.map((order) => order.toJSON()),
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = orderIdSchema.parse(req.params);
      const order = await this.getOrderUseCase.execute(id);

      res.status(200).json(order.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = orderIdSchema.parse(req.params);
      const validated = updateOrderStatusSchema.parse(req.body);

      const order = await this.updateOrderStatusUseCase.execute(id, {
        status: validated.status,
      });

      res.status(200).json(order.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async assignDeliveryPerson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = orderIdSchema.parse(req.params);
      const validated = assignDeliveryPersonSchema.parse(req.body);

      const token = req.headers.authorization?.split(' ')[1] || '';

      const order = await this.assignDeliveryPersonUseCase.execute(
        id,
        { deliveryPersonId: validated.deliveryPersonId },
        token,
      );

      res.status(200).json(order.toJSON());
    } catch (error) {
      next(error);
    }
  }
}