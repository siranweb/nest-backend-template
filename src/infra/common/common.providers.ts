import { COMMON_DI_CONSTANTS } from '@/infra/common/common.di-constants';
import { ExceptionFilter, NestInterceptor, Provider, Scope } from '@nestjs/common';
import { ErrorFilter } from '@/infra/common/filters/error.filter';
import { IConfigService } from '@/infra/config/types/config-service.interface';
import { ILogger } from '@/lib/logger/types/logger.interface';
import { Logger } from '@/lib/logger';
import { CONFIG_DI_CONSTANTS } from '@/infra/config/config.di-constants';
import { IRequestAsyncStorage } from '@/infra/common/types/request-async-storage.interface';
import { requestAsyncStorage } from '@/infra/common/providers/request-async-storage.provider';
import { RequestIdHeaderInterceptor } from '@/infra/common/interceptors/request-id-header.interceptor';

export const publicProviders: Provider[] = [
  {
    provide: COMMON_DI_CONSTANTS.ERROR_FILTER,
    useClass: ErrorFilter,
  } satisfies Provider<ExceptionFilter>,
  {
    provide: COMMON_DI_CONSTANTS.LOGGER,
    useFactory(configService: IConfigService, requestsAsyncStorage: IRequestAsyncStorage): ILogger {
      const nodeEnv = configService.get('nodeEnv', { infer: true });
      return new Logger({ nodeEnv, asyncStorage: requestsAsyncStorage });
    },
    inject: [CONFIG_DI_CONSTANTS.CONFIG_SERVICE, COMMON_DI_CONSTANTS.REQUEST_ASYNC_STORAGE],
    scope: Scope.TRANSIENT,
  } satisfies Provider<ILogger>,
  {
    provide: COMMON_DI_CONSTANTS.REQUEST_ASYNC_STORAGE,
    useValue: requestAsyncStorage,
  } satisfies Provider<IRequestAsyncStorage>,
  {
    provide: COMMON_DI_CONSTANTS.REQUEST_ID_HEADER_INTERCEPTOR,
    useClass: RequestIdHeaderInterceptor,
  } satisfies Provider<NestInterceptor>,
];

export const providers: Provider[] = [...publicProviders];
