import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '@qazaq-tas/shared';
import type { FastifyRequest } from 'fastify';
import { IsString, MinLength } from 'class-validator';
import { AuthService, type AuthTokens, type RequestMeta } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto, RefreshDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Новый пароль не короче 8 символов' })
  newPassword: string;
}

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Вход в систему' })
  login(@Body() dto: LoginDto, @Req() req: FastifyRequest): Promise<AuthTokens> {
    return this.auth.login(dto.email, dto.password, meta(req));
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Обновление токена доступа' })
  refresh(@Body() dto: RefreshDto, @Req() req: FastifyRequest): Promise<AuthTokens> {
    return this.auth.refresh(dto.refreshToken, meta(req));
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Выход из системы' })
  async logout(@Body() dto: RefreshDto): Promise<void> {
    await this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Текущий пользователь' })
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }

  @Post('change-password')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Смена пароля' })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.auth.changePassword(user.id, dto.currentPassword, dto.newPassword);
  }
}

function meta(req: FastifyRequest): RequestMeta {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']?.slice(0, 255),
  };
}
