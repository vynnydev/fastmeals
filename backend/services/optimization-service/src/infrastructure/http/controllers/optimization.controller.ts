import { Request, Response, NextFunction } from 'express';
import { OptimizeAssignmentUseCase } from '../../../application/use-cases/optimize-assignment.use-case';

export class OptimizationController {
  constructor(private readonly optimizeUseCase: OptimizeAssignmentUseCase) {}

  async optimize(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1] || '';

      const result = await this.optimizeUseCase.execute(token);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}