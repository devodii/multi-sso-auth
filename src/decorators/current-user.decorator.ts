import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUser = <T extends Record<string, any>>() => {
  return createParamDecorator<keyof T | undefined, ExecutionContext, T>(
    (data: keyof T | undefined, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const user = request.currentUser as T;
      return data ? user?.[data] : user;
    },
  )();
};
