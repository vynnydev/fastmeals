import { Request, Response, NextFunction } from 'express';
import { CreateDeliveryPersonUseCase } from '../../../application/use-cases/create-delivery-person.use-case';
import { UpdateDeliveryPersonUseCase } from '../../../application/use-cases/update-delivery-person.use-case';
import { DeleteDeliveryPersonUseCase } from '../../../application/use-cases/delete-delivery-person.use-case';
import { GetDeliveryPersonUseCase } from '../../../application/use-cases/get-delivery-person.use-case';
import { ListDeliveryPersonsUseCase } from '../../../application/use-cases/list-delivery-persons.use-case';
import {
  createDeliveryPersonSchema,
  updateDeliveryPersonSchema,
  listDeliveryPersonsQuerySchema,
  deliveryPersonIdSchema,
} from '../validators/delivery-person.validator';

export class DeliveryPersonController {
  constructor(
    private readonly createUseCase: CreateDeliveryPersonUseCase,
    private readonly updateUseCase: UpdateDeliveryPersonUseCase,
    private readonly deleteUseCase: DeleteDeliveryPersonUseCase,
    private readonly getUseCase: GetDeliveryPersonUseCase,
    private readonly listUseCase: ListDeliveryPersonsUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createDeliveryPersonSchema.parse(req.body);
      const deliveryPerson = await this.createUseCase.execute(validated);

      res.status(201).json(deliveryPerson.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = deliveryPersonIdSchema.parse(req.params);
      const validated = updateDeliveryPersonSchema.parse(req.body);
      const deliveryPerson = await this.updateUseCase.execute(id, validated);

      res.status(200).json(deliveryPerson.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = deliveryPersonIdSchema.parse(req.params);
      await this.deleteUseCase.execute(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = deliveryPersonIdSchema.parse(req.params);
      const deliveryPerson = await this.getUseCase.execute(id);

      res.status(200).json(deliveryPerson.toJSON());
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = listDeliveryPersonsQuerySchema.parse(req.query);

      const deliveryPersons = await this.listUseCase.execute({
        isActive: query.isActive,
        available: query.available,
      });

      res.status(200).json({
        data: deliveryPersons.map((person) => person.toJSON()),
      });
    } catch (error) {
      next(error);
    }
  }
}