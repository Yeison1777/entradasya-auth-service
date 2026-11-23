import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import {
  EmailAlreadyRegisteredError,
  InactiveUserError,
  InvalidCredentialsError,
  UserNotFoundError,
} from '../../../application/errors/auth.errors';

type KnownAuthError =
  | EmailAlreadyRegisteredError
  | InvalidCredentialsError
  | InactiveUserError
  | UserNotFoundError;

@Catch(
  EmailAlreadyRegisteredError,
  InvalidCredentialsError,
  InactiveUserError,
  UserNotFoundError,
)
export class AuthExceptionFilter implements ExceptionFilter<KnownAuthError> {
  catch(exception: KnownAuthError, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const { statusCode, code } = this.describe(exception);

    response.status(statusCode).json({
      statusCode,
      code,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private describe(exception: KnownAuthError): {
    statusCode: number;
    code: string;
  } {
    if (exception instanceof EmailAlreadyRegisteredError) {
      return {
        statusCode: HttpStatus.CONFLICT,
        code: 'EMAIL_ALREADY_REGISTERED',
      };
    }
    if (exception instanceof InvalidCredentialsError) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'INVALID_CREDENTIALS',
      };
    }
    if (exception instanceof InactiveUserError) {
      return { statusCode: HttpStatus.FORBIDDEN, code: 'INACTIVE_USER' };
    }
    return { statusCode: HttpStatus.NOT_FOUND, code: 'USER_NOT_FOUND' };
  }
}
