import { User } from './user';
import { UserRole } from './user-role';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}
