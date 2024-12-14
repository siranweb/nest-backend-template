/*
 * Original:
 * https://github.com/BenLorantfy/nestjs-zod/blob/main/packages/nestjs-zod/src/dto.ts
 */

import { ZodSchema, ZodTypeDef } from 'zod';
import { SchemaObject } from 'zod-openapi/dist/openapi3-ts/dist/model/openapi31';
import { createSchema } from 'zod-openapi';
import { throwInternalError } from '@/shared/utils/errors';

export interface ZodDto<TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput> {
  new (): TOutput;
  isZodDto: true;
  schema: ZodSchema<TOutput, TDef, TInput>;
  create(input: unknown): TOutput;
}

export function createZodDto<TOutput = any, TDef extends ZodTypeDef = ZodTypeDef, TInput = TOutput>(
  schema: ZodSchema<TOutput, TDef, TInput>,
  type: TZodDtoType = 'dto',
) {
  class AugmentedZodDto {
    public static isZodDto = true;
    public static schema = schema;

    public static _OPENAPI_METADATA_FACTORY(): Record<string, any> | undefined {
      const schema = createSchema(this.schema, {
        openapi: '3.1.0',
      }).schema as SchemaObject;
      addSchemaProperties(schema);
      return schema.properties;
    }

    public static create(input: TInput) {
      if (type === 'dto') {
        return this.schema.parse(input);
      } else {
        const result = this.schema.safeParse(input);
        if (!result.success) {
          throwInternalError(result.error);
        } else {
          return result.data;
        }
      }
    }
  }

  return AugmentedZodDto as unknown as ZodDto<TOutput, TDef, TInput>;
}

export function isZodDto(metatype: any): metatype is ZodDto<unknown> {
  return metatype?.isZodDto;
}

function addSchemaProperties(schema: SchemaObject): void {
  const keys = Object.keys(schema.properties ?? {});
  keys.forEach((key) => {
    const property = schema.properties![key] as SchemaObject;
    if (property.type === 'object') {
      addSchemaProperties(property);
    } else {
      // @ts-ignore
      schema.properties![key].required = !!(schema.required && schema.required.includes(key));
    }
  });
}

type TZodDtoType = 'dto' | 'response';
