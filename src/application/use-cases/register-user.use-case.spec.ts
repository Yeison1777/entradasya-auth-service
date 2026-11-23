import { User } from '../../domain/user';
import { UserRole } from '../../domain/user-role';
import { UserRepository } from '../../domain/user.repository';
import { EmailAlreadyRegisteredError } from '../errors/auth.errors';
import { PasswordHasher } from '../ports/password-hasher';
import { TokenService } from '../ports/token-service';
import { RegisterUserUseCase } from './register-user.use-case';

describe('RegisterUserUseCase', () => {
  const createdUser: User = {
    id: '0c894bb3-364f-4df5-863a-2fdbc7cd73d0',
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
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    users = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    passwords = { hash: jest.fn(), verify: jest.fn() };
    tokens = { sign: jest.fn() };
    useCase = new RegisterUserUseCase(users, passwords, tokens);
  });

  it('registers a client with normalized data and no password in the response', async () => {
    users.findByEmail.mockResolvedValue(null);
    passwords.hash.mockResolvedValue('hashed-password');
    users.create.mockResolvedValue(createdUser);
    tokens.sign.mockResolvedValue('signed-token');

    const result = await useCase.execute({
      name: '  Ana Cliente  ',
      email: '  ANA@EXAMPLE.COM ',
      password: 'Password123',
    });

    expect(users.create.mock.calls[0]?.[0]).toEqual({
      name: 'Ana Cliente',
      email: 'ana@example.com',
      passwordHash: 'hashed-password',
      role: UserRole.CLIENT,
    });
    expect(result.accessToken).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejects an email that is already registered', async () => {
    users.findByEmail.mockResolvedValue(createdUser);

    await expect(
      useCase.execute({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'Password123',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyRegisteredError);

    expect(users.create.mock.calls).toHaveLength(0);
  });
});
