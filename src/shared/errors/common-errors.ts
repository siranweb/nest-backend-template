import { defineError } from '@/shared/errors/utils/define-error';
import { z } from 'zod';

const zodIssueExample = [
  {
    code: 'invalid_type',
    expected: 'string',
    received: 'undefined',
    path: ['someField'],
    message: 'Required',
  },
];

export class HttpError extends defineError('HTTP') {}
export class UnknownError extends defineError('UNKNOWN') {}
export class ValidationError extends defineError('VALIDATION', {
  issues: z.array(z.record(z.string(), z.any())).openapi({
    title: 'Array of Zod issues',
    example: zodIssueExample,
  }),
}) {}
