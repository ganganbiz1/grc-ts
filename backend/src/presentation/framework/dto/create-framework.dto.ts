import { z } from 'zod';

/**
 * CreateFramework Request DTO Schema
 */
export const CreateFrameworkSchema = z.object({
  name: z
    .string()
    .min(1, '規格名は必須です')
    .max(100, '規格名は100文字以内で入力してください'),
  description: z
    .string()
    .max(1000, '説明は1000文字以内で入力してください')
    .nullish()
    .transform((val) => val ?? null),
});

export type CreateFrameworkDto = z.infer<typeof CreateFrameworkSchema>;
