import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@qazaq-tas/shared';

/** Возвращает пользователя из проверенного токена. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user,
);
