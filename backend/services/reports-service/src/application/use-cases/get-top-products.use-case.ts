import { IReportRepository, TopProductsReport } from '../../domain/repositories/report-repository.interface';
import { TopProductsQueryDTO } from '../dtos/report-query.dto';

export class GetTopProductsUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  async execute(dto: TopProductsQueryDTO): Promise<TopProductsReport> {
    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }

    return this.reportRepository.getTopProducts(startDate, endDate, dto.limit || 10);
  }
}