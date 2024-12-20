import { Logger as PinoLogger, LoggerOptions as PinoLoggerOptions, pino } from 'pino';
import { ILogger, TLoggerOptions } from '@/lib/logger/types/logger.interface';
import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class Logger implements ILogger {
  private context: string;
  public readonly pinoLogger: PinoLogger;

  constructor(private readonly options: TLoggerOptions = {}) {
    const { context, nodeEnv, asyncStorage } = this.options;
    const level = nodeEnv === 'development' ? 'trace' : 'info';
    const pretty = nodeEnv === 'development';

    const pinoConfig: PinoLoggerOptions = {
      level,
      formatters: {
        level: (label: string) => ({
          level: label,
        }),
      },
    };

    if (pretty) {
      pinoConfig.transport = {
        target: 'pino-pretty',
      };
    }

    if (asyncStorage) {
      pinoConfig.mixin = () => {
        return {
          requestId: asyncStorage.getStore()?.requestId,
        };
      };
    }

    this.pinoLogger = this.options.parent?.pinoLogger ?? pino(pinoConfig);
    this.context = context ?? '';
  }

  public setContext(context: string): void {
    this.context = context;
  }

  public trace(message: string, data: Record<string, any> = {}): void {
    this.pinoLogger.trace(this.wrapDataIfExist(data), this.prepareMessage(message));
  }

  public debug(message: string, data: Record<string, any> = {}): void {
    this.pinoLogger.debug(this.wrapDataIfExist(data), this.prepareMessage(message));
  }

  public info(message: string, data: Record<string, any> = {}): void {
    this.pinoLogger.info(this.wrapDataIfExist(data), this.prepareMessage(message));
  }

  public warn(message: string, data: Record<string, any> = {}): void {
    this.pinoLogger.warn(this.wrapDataIfExist(data), this.prepareMessage(message));
  }

  public error(
    errorOrMessage: Error | string,
    messageOrData?: string | Record<string, any>,
    data?: Record<string, any>,
  ): void {
    const error = errorOrMessage instanceof Error ? errorOrMessage : null;
    const message = (errorOrMessage instanceof Error ? messageOrData : errorOrMessage) as string;
    const logData = (typeof messageOrData === 'object' ? messageOrData : (data ?? {})) as Record<
      string,
      any
    >;
    const meta: Record<string, any> = {
      ...logData,
    };
    const plainError = error ? this.getPlainError(error) : null;
    if (plainError) {
      meta.error = plainError;
    }
    this.pinoLogger.error(this.wrapDataIfExist(meta), message ? this.prepareMessage(message) : '');
  }

  public fatal(
    errorOrMessage: Error | string,
    messageOrData?: string | Record<string, any>,
    data?: Record<string, any>,
  ): void {
    const error = errorOrMessage instanceof Error ? errorOrMessage : null;
    const message = (errorOrMessage instanceof Error ? messageOrData : errorOrMessage) as string;
    const logData = (typeof messageOrData === 'object' ? messageOrData : (data ?? {})) as Record<
      string,
      any
    >;

    const meta: Record<string, any> = {
      ...logData,
    };
    const plainError = error ? this.getPlainError(error) : null;
    if (plainError) {
      meta.error = plainError;
    }
    this.pinoLogger.fatal(this.wrapDataIfExist(meta), message ? this.prepareMessage(message) : '');
  }

  private prepareMessage(message: string): string {
    return this.withContext(message);
  }

  private withContext(message: string): string {
    return this.context ? `[${this.context}] ${message}` : message;
  }

  private getPlainError(error: object): object {
    const plainError: object = { ...error };
    // @ts-ignore
    Object.getOwnPropertyNames(error).forEach((name) => (plainError[name] = error[name]));
    return plainError;
  }

  private wrapDataIfExist(data: Record<string, any>): Record<string, any> {
    return Object.keys(data).length > 0 ? { data } : {};
  }
}
