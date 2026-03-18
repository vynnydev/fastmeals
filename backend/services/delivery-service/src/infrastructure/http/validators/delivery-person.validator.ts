import { z } from 'zod';

const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;

export const createDeliveryPersonSchema = z.object({
  name: z
    .string({ required_error: 'O nome é obrigatório' })
    .min(3, 'O nome deve ter entre 3 e 100 caracteres')
    .max(100, 'O nome deve ter entre 3 e 100 caracteres')
    .trim(),

  phone: z
    .string({ required_error: 'O telefone é obrigatório' })
    .regex(phoneRegex, 'Formato de telefone inválido. Use: (XX) XXXXX-XXXX'),

  vehicleType: z.enum(['bicycle', 'motorcycle', 'car'], {
    required_error: 'O tipo de veículo é obrigatório',
    invalid_type_error: 'Tipo de veículo inválido. Valores aceitos: bicycle, motorcycle, car',
  }),

  currentLatitude: z
    .number()
    .min(-90, 'Latitude deve ser entre -90 e 90')
    .max(90, 'Latitude deve ser entre -90 e 90')
    .optional(),

  currentLongitude: z
    .number()
    .min(-180, 'Longitude deve ser entre -180 e 180')
    .max(180, 'Longitude deve ser entre -180 e 180')
    .optional(),
});

export const updateDeliveryPersonSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter entre 3 e 100 caracteres')
    .max(100, 'O nome deve ter entre 3 e 100 caracteres')
    .trim()
    .optional(),

  phone: z
    .string()
    .regex(phoneRegex, 'Formato de telefone inválido. Use: (XX) XXXXX-XXXX')
    .optional(),

  vehicleType: z
    .enum(['bicycle', 'motorcycle', 'car'], {
      invalid_type_error: 'Tipo de veículo inválido. Valores aceitos: bicycle, motorcycle, car',
    })
    .optional(),

  isActive: z
    .boolean({ invalid_type_error: 'isActive deve ser true ou false' })
    .optional(),

  currentLatitude: z
    .number()
    .min(-90, 'Latitude deve ser entre -90 e 90')
    .max(90, 'Latitude deve ser entre -90 e 90')
    .optional(),

  currentLongitude: z
    .number()
    .min(-180, 'Longitude deve ser entre -180 e 180')
    .max(180, 'Longitude deve ser entre -180 e 180')
    .optional(),
});

export const listDeliveryPersonsQuerySchema = z.object({
  isActive: z
    .string()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    })
    .optional(),
  available: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export const deliveryPersonIdSchema = z.object({
  id: z.string().uuid('ID do entregador deve ser um UUID válido'),
});

export type CreateDeliveryPersonInput = z.infer<typeof createDeliveryPersonSchema>;
export type UpdateDeliveryPersonInput = z.infer<typeof updateDeliveryPersonSchema>;
export type ListDeliveryPersonsQuery = z.infer<typeof listDeliveryPersonsQuerySchema>;