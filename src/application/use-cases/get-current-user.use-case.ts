import { Inject, Injectable } from '@nestjs/common';

import { PublicUser } from '../../domain/user';
import { USER_REPOSITORY } from '../../domain/user.repository';
import type { UserRepository } from '../../domain/user.repository';
import { toPublicUser } from '../auth-session';
import { InactiveUserError, UserNotFoundError } from '../errors/auth.errors';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (!user.active) {
      throw new InactiveUserError();
    }

    return toPublicUser(user);
  }
}
