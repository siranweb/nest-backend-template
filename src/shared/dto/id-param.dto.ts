import { z } from 'zod';
import { UUID_EXAMPLE } from '@/shared/constants';
import { createZodDto } from '@/lib/zod-dto/dto-helpers';

export const idSchema = z.string().uuid();

const idParamSchema = z.object({
  id: idSchema.openapi({ description: 'Айди', example: UUID_EXAMPLE }),
});

export class IdParamDto extends createZodDto(idParamSchema) {}
