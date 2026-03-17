import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'O email é obrigatório',
    })
    .email('Formato de email inválido')
    .max(255, 'O email deve ter no máximo 255 caracteres')
    .transform((val) => val.toLowerCase().trim()),

  password: z
    .string({
      required_error: 'A senha é obrigatória',
    })
    .min(1, 'A senha é obrigatória'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      required_error: 'O refresh token é obrigatório',
    })
    .min(1, 'O refresh token é obrigatório'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;