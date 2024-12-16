import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '@/app.module';
import * as fastifyCookie from '@fastify/cookie';
import { IConfigService } from '@/infra/config/types/config-service.interface';
import { CONFIG_DI_CONSTANTS } from '@/infra/config/config.di-constants';
import { ILogger } from '@/lib/logger/types/logger.interface';
import { API_COMMON_DI_CONSTANTS } from '@/infra/api-common/api-common.di-constants';
import { SwaggerModule } from '@nestjs/swagger';
import { ZodDtoValidationPipe } from '@/infra/api-common/pipes/zod-dto-validation.pipe';
import { initInstance } from '@/bootstrap/instance/init-instance';
import { setInstanceHooks } from '@/bootstrap/instance/set-instance-hooks';
import { getSwaggerConfig } from '@/bootstrap/swagger/get-swagger-config';
import { CanActivate, ExceptionFilter, NestInterceptor } from '@nestjs/common';
import { COMMON_DI_CONSTANTS } from '@/infra/common/common.di-constants';

export async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(initInstance()),
  );
  await app.register(fastifyCookie);
  const adapter = app.getHttpAdapter();
  const instance = adapter.getInstance();
  const configService = await app.resolve<IConfigService>(CONFIG_DI_CONSTANTS.CONFIG_SERVICE);
  const bootstrapLogger = await app.resolve<ILogger>(COMMON_DI_CONSTANTS.LOGGER);
  const httpLogger = await app.resolve<ILogger>(COMMON_DI_CONSTANTS.LOGGER);
  const errorFilter = await app.resolve<ExceptionFilter>(API_COMMON_DI_CONSTANTS.ERROR_FILTER);
  const requestIdHeaderInterceptor = await app.resolve<NestInterceptor>(
    API_COMMON_DI_CONSTANTS.REQUEST_ID_HEADER_INTERCEPTOR,
  );
  const authGuard = await app.resolve<CanActivate>(API_COMMON_DI_CONSTANTS.AUTH_GUARD);
  const config = configService.get('webServer', { infer: true });

  bootstrapLogger.setContext('Bootstrap');
  httpLogger.setContext('HTTP');

  setInstanceHooks(instance, httpLogger);

  const documentFactory = () => SwaggerModule.createDocument(app, getSwaggerConfig());
  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalFilters(errorFilter);
  app.useGlobalPipes(new ZodDtoValidationPipe());
  app.useGlobalInterceptors(requestIdHeaderInterceptor);
  app.useGlobalGuards(authGuard);

  await app.listen(config.port, '0.0.0.0');

  bootstrapLogger.info('Server started!');
  bootstrapLogger.info(`OpenAPI Documentation: http://localhost:${config.port}/docs`);
  bootstrapLogger.info(`JSON: http://localhost:${config.port}/docs-json`);
  bootstrapLogger.info(`YAML: http://localhost:${config.port}/docs-yaml`);
}
