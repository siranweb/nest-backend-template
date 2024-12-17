import { Reflector } from '@nestjs/core';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import { HttpError } from '@/shared/errors/common-errors';
import { ApiResponses } from '@/infra/api-common/decorators/api-responses.decorator';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ACCESS_TOKEN_COOKIE_NAME } from '@/shared/constants';
import { TAuthMode } from '@/infra/api-common/types/auth-decorator.types';

/**
 * Помечает API для авторизации.
 */
export const AuthModeMetadata = Reflector.createDecorator<TAuthMode>();

/**
 * Декоратор для авторизации. Должен использоваться для хэндлеров.
 * @param [mode] Режим авторизации. По-умолчанию - "normal"
 */
export function Auth(mode: TAuthMode = 'normal') {
  const decorators = [
    AuthModeMetadata(mode),
    ApiBearerAuth(),
    ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME),
  ];

  if (mode === 'normal') {
    decorators.push(
      ApiResponses(HttpStatus.UNAUTHORIZED, [HttpError], { description: 'Не авторизован' }),
    );
  }

  return applyDecorators(...decorators);
}
