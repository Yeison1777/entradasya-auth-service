import { Inject, Injectable } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/user.repository';
import type { UserRepository } from '../../domain/user.repository';
import { AuthSession, toPublicUser } from '../auth-session';
import {
  InactiveUserError,
  InvalidCredentialsError,
} from '../errors/auth.errors';
import { PASSWORD_HASHER } from '../ports/password-hasher';
import type { PasswordHasher } from '../ports/password-hasher';
import { TOKEN_SERVICE } from '../ports/token-service';
import type { TokenService } from '../ports/token-service';

export interface LoginUserInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<AuthSession> {
    const user = await this.users.findByEmail(input.email.trim().toLowerCase());

    if (
      !user ||
      !(await this.passwordHasher.verify(user.passwordHash, input.password))
    ) {
      throw new InvalidCredentialsError();
    }

    if (!user.active) {
      throw new InactiveUserError();
    }

    const accessToken = await this.tokens.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { accessToken, user: toPublicUser(user) };
  }
}
