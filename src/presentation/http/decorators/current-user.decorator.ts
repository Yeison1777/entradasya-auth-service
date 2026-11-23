import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AccessTokenPayload } from '../../../application/ports/token-service';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AccessTokenPayload => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AccessTokenPayload }>();
    return request.user;
  },
);
