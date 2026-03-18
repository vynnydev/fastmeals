import { getPrismaClient } from '../database/prisma-client';
import { PrismaDeliveryPersonRepository } from '../repositories/prisma-delivery-person.repository';
import { CreateDeliveryPersonUseCase } from '../../application/use-cases/create-delivery-person.use-case';
import { UpdateDeliveryPersonUseCase } from '../../application/use-cases/update-delivery-person.use-case';
import { DeleteDeliveryPersonUseCase } from '../../application/use-cases/delete-delivery-person.use-case';
import { GetDeliveryPersonUseCase } from '../../application/use-cases/get-delivery-person.use-case';
import { ListDeliveryPersonsUseCase } from '../../application/use-cases/list-delivery-persons.use-case';
import { DeliveryPersonController } from '../http/controllers/delivery-person.controller';

export interface Container {
  deliveryPersonController: DeliveryPersonController;
}

export function createContainer(): Container {
  const prisma = getPrismaClient();

  // Repository (no external client dependency)
  const repository = new PrismaDeliveryPersonRepository(prisma);

  // Use Cases
  const createUseCase = new CreateDeliveryPersonUseCase(repository);
  const updateUseCase = new UpdateDeliveryPersonUseCase(repository);
  const deleteUseCase = new DeleteDeliveryPersonUseCase(repository);
  const getUseCase = new GetDeliveryPersonUseCase(repository);
  const listUseCase = new ListDeliveryPersonsUseCase(repository);

  // Controller
  const deliveryPersonController = new DeliveryPersonController(
    createUseCase,
    updateUseCase,
    deleteUseCase,
    getUseCase,
    listUseCase,
  );

  return {
    deliveryPersonController,
  };
}