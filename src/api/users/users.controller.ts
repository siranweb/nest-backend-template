import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponses } from '@/infra/api-common/decorators/api-responses.decorator';
import { Auth } from '@/infra/api-common/decorators/auth.decorator';
import { SharedResponses } from '@/infra/api-common/decorators/shared-responses.decorator';
import { TokenPayload } from '@/infra/api-common/decorators/token-payload.decorator';
import { TAccessTokenPayload } from '@/core/users/types/shared';
import { ICreateUserCase } from '@/core/users/types/create-user-case.interface';
import { IGetUserProfileCase } from '@/core/users/types/get-user-profile-case.interface';
import { USERS_DI_CONSTANTS } from '@/core/users/users.di-constants';
import { UserProfileResponse } from '@/api/users/responses';
import { CreateUserDto } from '@/api/users/dto/create-user.dto';
import { UserLoginTakenError, UserNotFoundError } from '@/core/users/errors';

@ApiTags('users')
@Controller('/users')
@SharedResponses()
export class UsersController {
  constructor(
    @Inject(USERS_DI_CONSTANTS.CREATE_USER_CASE)
    private readonly createUserCase: ICreateUserCase,
    @Inject(USERS_DI_CONSTANTS.GET_USER_PROFILE_CASE)
    private readonly getUserProfileCase: IGetUserProfileCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Создать нового пользователя и получить токены в куки' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponses(HttpStatus.NO_CONTENT, { description: 'Пользователь создан' })
  @ApiResponses(HttpStatus.BAD_REQUEST, [UserLoginTakenError])
  public async create(@Body() dto: CreateUserDto): Promise<void> {
    await this.createUserCase.execute(dto);
  }

  @Get('/me/profile')
  @ApiOperation({ summary: 'Возвращает профиль авторизованного пользователя' })
  @Auth()
  @HttpCode(HttpStatus.OK)
  @ApiResponses(HttpStatus.OK, [UserProfileResponse], { description: 'Профиль пользователя' })
  @ApiResponses(HttpStatus.BAD_REQUEST, [UserNotFoundError])
  public async getAuthUserProfile(
    @TokenPayload() payload: TAccessTokenPayload,
  ): Promise<UserProfileResponse> {
    const profile = await this.getUserProfileCase.execute(payload.userId);
    return UserProfileResponse.create(profile);
  }
}
