import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponses } from '@/infra/api-common/decorators/api-responses.decorator';
import { UnknownError, ValidationError } from '@/shared/errors/common-errors';

/**
 * Общие ответы для всех контроллеров.
 */
export function SharedResponses() {
  return applyDecorators(
    ApiResponses(HttpStatus.BAD_REQUEST, [ValidationError], { description: 'Ошибка запроса' }),
    ApiResponses(HttpStatus.INTERNAL_SERVER_ERROR, [UnknownError], {
      description: 'Внутренняя ошибка сервера',
    }),
  );
}
