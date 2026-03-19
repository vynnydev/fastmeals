import { IReportRepository, RevenueReport } from '../../domain/repositories/report-repository.interface';
import { RevenueQueryDTO } from '../dtos/report-query.dto';

export class GetRevenueUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(dto: RevenueQueryDTO): Promise<RevenueReport> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Set endDate to end of day
    endDate.setHours(23, 59, 59, 999);

    return this.reportRepository.getRevenue(startDate, endDate);
  }
}