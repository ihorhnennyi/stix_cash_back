import { SetMetadata } from '@nestjs/common';
import { Role } from '../../types/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Декоратор для задания ролей, необходимых для доступа к маршруту.
 * @param roles - Роли, которым разрешён доступ
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
