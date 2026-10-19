import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { SafeUser } from '../service/interface/IAuthService.js';

/**
 * Custom parameter decorator to extract the authenticated user from the request.
 * Usage: @CurrentUser() user: SafeUser
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): SafeUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
