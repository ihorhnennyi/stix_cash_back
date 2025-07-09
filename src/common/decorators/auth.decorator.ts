import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '../../types/role.enum';
import { Roles } from './roles.decorator';

/**
 * Композитный декоратор для авторизации с проверкой ролей.
 *
 * @param roles - Список допустимых ролей (например: 'admin', 'user')
 */
export function Auth(...roles: Role[]) {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
}
