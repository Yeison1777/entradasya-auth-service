import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { PASSWORD_HASHER } from './application/ports/password-hasher';
import { TOKEN_SERVICE } from './application/ports/token-service';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaService } from './infrastructure/database/prisma.service';
import { PrismaUserRepository } from './infrastructure/database/prisma-user.repository';
import { ArgonPasswordHasher } from './infrastructure/security/argon-password-hasher';
import { JwtTokenService } from './infrastructure/security/jwt-token.service';
import { AuthController } from './presentation/http/auth.controller';
import { HealthController } from './presentation/http/health.controller';
import { InternalUsersController } from './presentation/http/internal-users.controller';
import { InternalApiKeyGuard } from './presentation/http/guards/internal-api-key.guard';
import { JwtAuthGuard } from './presentation/http/guards/jwt-auth.guard';
import { RolesGuard } from './presentation/http/guards/roles.guard';
import { JwtStrategy } from './presentation/http/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController, InternalUsersController, HealthController],
  providers: [
    PrismaService,
    RegisterUserUseCase,
    LoginUserUseCase,
    GetCurrentUserUseCase,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    InternalApiKeyGuard,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER, useClass: ArgonPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
})
export class AuthModule {}
