import { createZodDto } from '@/lib/zod-dto/dto-helpers';
import { userProfileSchema } from '@/api/users/schemas/user-profile.schema';

export class UserProfileResponse extends createZodDto(userProfileSchema, 'response') {}
