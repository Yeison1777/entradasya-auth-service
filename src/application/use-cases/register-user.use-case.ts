import { Inject, Injectable } from '@nestjs/common';

import { UserRole } from '../../domain/user-role';
import { USER_REPOSITORY } from '../../domain/user.repository';
import type { UserRepository } from '../../domain/user.repository';
import { AuthSession, toPublicUser } from '../auth-session';
import { EmailAlreadyRegisteredError } from '../errors/auth.errors';
import { PASSWORD_HASHER } from '../ports/password-hasher';
import type { PasswordHasher } from '../ports/password-hasher';
import { TOKEN_SERVICE } from '../ports/token-service';
import type { TokenService } from '../ports/token-service';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthSession> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.users.findByEmail(email);

    if (existingUser) {
      throw new EmailAlreadyRegisteredError();
    }

    const user = await this.users.create({
      name: input.name.trim(),
      email,
      passwordHash: await this.passwordHasher.hash(input.password),
      role: UserRole.CLIENT,
    });

    const accessToken = await this.tokens.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return { accessToken, user: toPublicUser(user) };
  }
}
