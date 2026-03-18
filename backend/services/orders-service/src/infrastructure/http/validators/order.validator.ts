import { z } from 'zod';

const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;

export const createOrderSchema = z.object({
  customerName: z
    .string({ required_error: 'O nome do cliente é obrigatório' })
    .min(3, 'O nome deve ter entre 3 e 100 caracteres')
    .max(100, 'O nome deve ter entre 3 e 100 caracteres')
    .trim(),

  customerPhone: z
    .string({ required_error: 'O telefone do cliente é obrigatório' })
    .regex(phoneRegex, 'Formato de telefone inválido. Use: (XX) XXXXX-XXXX'),

  deliveryAddress: z
    .string({ required_error: 'O endereço de entrega é obrigatório' })
    .min(10, 'O endereço deve ter entre 10 e 300 caracteres')
    .max(300, 'O endereço deve ter entre 10 e 300 caracteres')
    .trim(),

  latitude: z
    .number({ required_error: 'A latitude é obrigatória' })
    .min(-90, 'Latitude deve ser entre -90 e 90')
    .max(90, 'Latitude deve ser entre -90 e 90'),

  longitude: z
    .number({ required_error: 'A longitude é obrigatória' })
    .min(-180, 'Longitude deve ser entre -180 e 180')
    .max(180, 'Longitude deve ser entre -180 e 180'),

  items: z
    .array(
      z.object({
        productId: z.string().uuid('productId deve ser um UUID válido'),
        quantity: z
          .number({ required_error: 'A quantidade é obrigatória' })
          .int('A quantidade deve ser um número inteiro')
          .positive('A quantidade deve ser maior que zero'),
      }),
    )
    .min(1, 'O pedido deve ter pelo menos 1 item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(
    ['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
    {
      required_error: 'O status é obrigatório',
      invalid_type_error: 'Status inválido',
    },
  ),
});

export const assignDeliveryPersonSchema = z.object({
  deliveryPersonId: z
    .string({ required_error: 'O ID do entregador é obrigatório' })
    .uuid('deliveryPersonId deve ser um UUID válido'),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(['pending', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'])
    .optional(),
  sortBy: z.enum(['createdAt', 'totalAmount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const orderIdSchema = z.object({
  id: z.string().uuid('ID do pedido deve ser um UUID válido'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AssignDeliveryInput = z.infer<typeof assignDeliveryPersonSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;