import { ExceptionFilter, Provider } from '@nestjs/common';
import { ErrorFilter } from '@/infra/common/filters/error.filter';
import { Logger } from '@/lib/logger';
import { ILogger } from '@/lib/logger/types/logger.interface';
import { ConfigService } from '@nestjs/config';
import { IConfigService } from '@/infra/config/types/config-service.interface';

export const COMMON_DI_CONSTANTS = {
  LOGGER: Symbol('LOGGER'),
  ERROR_FILTER: Symbol('ERROR_FILTER'),
};

export const publicProviders: Provider[] = [
  {
    provide: COMMON_DI_CONSTANTS.ERROR_FILTER,
    useClass: ErrorFilter,
  } satisfies Provider<ExceptionFilter>,
  {
    provide: COMMON_DI_CONSTANTS.LOGGER,
    useFactory(configService: IConfigService): ILogger {
      const nodeEnv = configService.get('nodeEnv', { infer: true });
      return new Logger({ nodeEnv });
    },
    inject: [ConfigService],
  } satisfies Provider<ILogger>,
];

export const providers: Provider[] = [...publicProviders];
