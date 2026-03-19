import { IReportRepository, AvgDeliveryTimeReport } from '../../domain/repositories/report-repository.interface';
import { DeliveryTimeQueryDTO } from '../dtos/report-query.dto';

export class GetAvgDeliveryTimeUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(dto: DeliveryTimeQueryDTO): Promise<AvgDeliveryTimeReport> {
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    return this.reportRepository.getAverageDeliveryTime(startDate, endDate);
  }
}