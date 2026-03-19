import { IReportRepository, OrdersByStatusReport } from '../../domain/repositories/report-repository.interface';

export class GetOrdersByStatusUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(): Promise<OrdersByStatusReport> {
    return this.reportRepository.getOrdersByStatus();
  }
}