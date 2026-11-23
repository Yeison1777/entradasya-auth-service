import { Injectable } from '@nestjs/common';

import { User } from '../../domain/user';
import { UserRole } from '../../domain/user-role';
import { CreateUserData, UserRepository } from '../../domain/user.repository';
import { User as PrismaUser } from '../../generated/prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return this.toDomain(user);
  }

  private toDomain(user: PrismaUser): User {
    return {
      ...user,
      role: user.role as UserRole,
    };
  }
}
