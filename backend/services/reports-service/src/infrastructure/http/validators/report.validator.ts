import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const revenueQuerySchema = z.object({
  startDate: z
    .string({ required_error: 'A data de início é obrigatória' })
    .regex(dateRegex, 'Formato de data inválido. Use: YYYY-MM-DD'),
  endDate: z
    .string({ required_error: 'A data de fim é obrigatória' })
    .regex(dateRegex, 'Formato de data inválido. Use: YYYY-MM-DD'),
});

export const topProductsQuerySchema = z.object({
  startDate: z.string().regex(dateRegex, 'Formato: YYYY-MM-DD').optional(),
  endDate: z.string().regex(dateRegex, 'Formato: YYYY-MM-DD').optional(),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const deliveryTimeQuerySchema = z.object({
  startDate: z.string().regex(dateRegex, 'Formato: YYYY-MM-DD').optional(),
  endDate: z.string().regex(dateRegex, 'Formato: YYYY-MM-DD').optional(),
});

export const aiInsightsQuerySchema = z.object({
  startDate: z
    .string({ required_error: 'A data de início é obrigatória' })
    .regex(dateRegex, 'Formato de data inválido. Use: YYYY-MM-DD'),
  endDate: z
    .string({ required_error: 'A data de fim é obrigatória' })
    .regex(dateRegex, 'Formato de data inválido. Use: YYYY-MM-DD'),
});