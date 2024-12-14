import { z } from 'zod';

export const paginationSchema = z.object({
  totalPages: z.number().openapi({ description: 'Всего страниц', example: 10 }),
  page: z.coerce.number().openapi({ description: 'Номер страницы', example: 2 }),
  limit: z.coerce
    .number()
    .openapi({ description: 'Максимальное кол-во записей на одной странице', example: 20 }),
});

export const paginationQuerySchema = paginationSchema.omit({ totalPages: true }).extend({
  page: paginationSchema.shape.page.min(1),
  limit: paginationSchema.shape.limit.min(1).max(100),
});
