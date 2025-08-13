import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../types/jwt-payload.interface';

export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext): any => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    if (!request.user) {
      return null;
    }

    return data ? request.user[data] : request.user;
  },
);
