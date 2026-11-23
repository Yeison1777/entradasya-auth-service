import { User } from '../../domain/user';
import { UserRole } from '../../domain/user-role';
import { UserRepository } from '../../domain/user.repository';
import {
  InactiveUserError,
  InvalidCredentialsError,
} from '../errors/auth.errors';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenService } from '../ports/token-service';
import { LoginUserUseCase } from './login-user.use-case';

describe('LoginUserUseCase', () => {
  const user: User = {
    id: 'd2fa631c-ffda-45d0-a04d-02f0ed37985d',
    name: 'Ana Cliente',
    email: 'ana@example.com',
    passwordHash: 'hashed-password',
    role: UserRole.CLIENT,
    active: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };

  let users: jest.Mocked<UserRepository>;
  let passwords: jest.Mocked<PasswordHasher>;
  let tokens: jest.Mocked<TokenService>;
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    passwords = { hash: jest.fn(), verify: jest.fn() };
    tokens = { sign: jest.fn() };
    useCase = new LoginUserUseCase(users, passwords, tokens);
  });

  it('returns a token for valid credentials', async () => {
    users.findByEmail.mockResolvedValue(user);
    passwords.verify.mockResolvedValue(true);
    tokens.sign.mockResolvedValue('signed-token');

    const result = await useCase.execute({
      email: 'ANA@EXAMPLE.COM',
      password: 'Password123',
    });

    expect(users.findByEmail.mock.calls[0]?.[0]).toBe('ana@example.com');
    expect(result.accessToken).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('does not reveal whether the email or password was incorrect', async () => {
    users.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'unknown@example.com',
        password: 'Password123',
      }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('rejects an inactive account', async () => {
    users.findByEmail.mockResolvedValue({ ...user, active: false });
    passwords.verify.mockResolvedValue(true);

    await expect(
      useCase.execute({ email: user.email, password: 'Password123' }),
    ).rejects.toBeInstanceOf(InactiveUserError);
  });
});
