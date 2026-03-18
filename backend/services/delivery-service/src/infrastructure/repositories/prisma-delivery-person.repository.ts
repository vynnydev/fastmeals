import { PrismaClient, Prisma } from '../../../generated/prisma/client';
import {
  IDeliveryPersonRepository,
  ListDeliveryPersonsParams,
  CreateDeliveryPersonData,
  UpdateDeliveryPersonData,
} from '../../domain/repositories/delivery-person-repository.interface';
import { DeliveryPerson, VehicleType } from '../../domain/entities/delivery-person.entity';

export class PrismaDeliveryPersonRepository implements IDeliveryPersonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<DeliveryPerson | null> {
    const record = await this.prisma.deliveryPerson.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return this.toDomain(record);
  }

  async findAll(params: ListDeliveryPersonsParams): Promise<DeliveryPerson[]> {
    const where: Prisma.DeliveryPersonWhereInput = {};

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const records = await this.prisma.deliveryPerson.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toDomain(record));
  }

  async findActiveWithoutDeliveringOrder(): Promise<DeliveryPerson[]> {
    // Returns all active delivery persons
    // The availability check (not assigned to delivering order) is done
    // via HTTP call to orders-service at the controller/use-case level
    // or via RabbitMQ events consumed by the server
    //
    // TODO: When orders-service integration is fully wired,
    // filter by checking delivering assignments
    const records = await this.prisma.deliveryPerson.findMany({
      where: { isActive: true },
    });

    return records.map((record) => this.toDomain(record));
  }

  async create(data: CreateDeliveryPersonData): Promise<DeliveryPerson> {
    const record = await this.prisma.deliveryPerson.create({
      data: {
        name: data.name,
        phone: data.phone,
        vehicleType: data.vehicleType as VehicleType,
        isActive: data.isActive ?? true,
        currentLatitude: data.currentLatitude,
        currentLongitude: data.currentLongitude,
      },
    });

    return this.toDomain(record);
  }

  async update(id: string, data: UpdateDeliveryPersonData): Promise<DeliveryPerson> {
    const updateData: Prisma.DeliveryPersonUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.vehicleType !== undefined) updateData.vehicleType = data.vehicleType as VehicleType;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.currentLatitude !== undefined) updateData.currentLatitude = data.currentLatitude;
    if (data.currentLongitude !== undefined) updateData.currentLongitude = data.currentLongitude;

    const record = await this.prisma.deliveryPerson.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.deliveryPerson.delete({
      where: { id },
    });
  }

  async isAssignedToDeliveringOrder(_deliveryPersonId: string): Promise<boolean> {
    // This check is done via HTTP to orders-service or via RabbitMQ events
    // For now, returns false (delivery-service doesn't have access to orders data)
    // The orders-service is the source of truth for order assignments
    //
    // In production, this would either:
    // 1. Call orders-service HTTP endpoint
    // 2. Check a local cache populated by RabbitMQ events
    return false;
  }

  private toDomain(record: {
    id: string;
    name: string;
    phone: string;
    vehicleType: string;
    isActive: boolean;
    currentLatitude: Prisma.Decimal | number | null;
    currentLongitude: Prisma.Decimal | number | null;
    createdAt: Date;
  }): DeliveryPerson {
    return new DeliveryPerson({
      id: record.id,
      name: record.name,
      phone: record.phone,
      vehicleType: record.vehicleType as VehicleType,
      isActive: record.isActive,
      currentLatitude: record.currentLatitude !== null
        ? (typeof record.currentLatitude === 'number' ? record.currentLatitude : Number(record.currentLatitude))
        : null,
      currentLongitude: record.currentLongitude !== null
        ? (typeof record.currentLongitude === 'number' ? record.currentLongitude : Number(record.currentLongitude))
        : null,
      createdAt: record.createdAt,
    });
  }
}