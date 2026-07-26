import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@qazaq-tas/shared';

export const ROLES_KEY = 'roles';

/** Ограничивает доступ к маршруту перечисленными ролями. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
