import { UnknownError } from '@/shared/errors/common-errors';

export function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function throwInternalError(error: unknown): never {
  const unknownError = new UnknownError();
  unknownError.cause = normalizeError(error);
  throw unknownError;
}

export async function withInternalError<T>(clb: () => T): Promise<T> {
  try {
    return await clb();
  } catch (e: unknown) {
    throwInternalError(e);
  }
}
