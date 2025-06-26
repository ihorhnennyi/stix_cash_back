import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../types/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();

    const user = request.user;
    if (!user || !user.roles) {
      console.log('RolesGuard: user or user.roles is missing');
      throw new ForbiddenException('Нет доступа');
    }

    if (!user || !user.roles) throw new ForbiddenException('Нет доступа');

    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) throw new ForbiddenException('Недостаточно прав');

    return true;
  }
}
