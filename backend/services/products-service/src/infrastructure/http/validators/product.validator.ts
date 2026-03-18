import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'O nome é obrigatório' })
    .min(3, 'O nome deve ter entre 3 e 120 caracteres')
    .max(120, 'O nome deve ter entre 3 e 120 caracteres')
    .trim(),

  description: z
    .string({ required_error: 'A descrição é obrigatória' })
    .min(10, 'A descrição deve ter entre 10 e 500 caracteres')
    .max(500, 'A descrição deve ter entre 10 e 500 caracteres')
    .trim(),

  price: z
    .number({ required_error: 'O preço é obrigatório' })
    .positive('O preço deve ser maior que zero')
    .multipleOf(0.01, 'O preço deve ter no máximo 2 casas decimais'),

  category: z.enum(['meal', 'drink', 'dessert', 'side'], {
    required_error: 'A categoria é obrigatória',
    invalid_type_error: 'Categoria inválida. Valores aceitos: meal, drink, dessert, side',
  }),

  imageUrl: z
    .string()
    .url('A URL da imagem deve ser válida')
    .max(500, 'A URL da imagem deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),

  preparationTime: z
    .number({ required_error: 'O tempo de preparo é obrigatório' })
    .int('O tempo de preparo deve ser um número inteiro')
    .min(1, 'O tempo de preparo deve ser entre 1 e 120 minutos')
    .max(120, 'O tempo de preparo deve ser entre 1 e 120 minutos'),
});

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter entre 3 e 120 caracteres')
    .max(120, 'O nome deve ter entre 3 e 120 caracteres')
    .trim()
    .optional(),

  description: z
    .string()
    .min(10, 'A descrição deve ter entre 10 e 500 caracteres')
    .max(500, 'A descrição deve ter entre 10 e 500 caracteres')
    .trim()
    .optional(),

  price: z
    .number()
    .positive('O preço deve ser maior que zero')
    .multipleOf(0.01, 'O preço deve ter no máximo 2 casas decimais')
    .optional(),

  category: z
    .enum(['meal', 'drink', 'dessert', 'side'], {
      invalid_type_error: 'Categoria inválida. Valores aceitos: meal, drink, dessert, side',
    })
    .optional(),

  imageUrl: z
    .string()
    .url('A URL da imagem deve ser válida')
    .max(500, 'A URL da imagem deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),

  isAvailable: z
    .boolean({ invalid_type_error: 'isAvailable deve ser true ou false' })
    .optional(),

  preparationTime: z
    .number()
    .int('O tempo de preparo deve ser um número inteiro')
    .min(1, 'O tempo de preparo deve ser entre 1 e 120 minutos')
    .max(120, 'O tempo de preparo deve ser entre 1 e 120 minutos')
    .optional(),
});

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  category: z.enum(['meal', 'drink', 'dessert', 'side']).optional(),
  isAvailable: z
    .string()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    })
    .optional(),
  sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const productIdSchema = z.object({
  id: z.string().uuid('ID do produto deve ser um UUID válido'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;