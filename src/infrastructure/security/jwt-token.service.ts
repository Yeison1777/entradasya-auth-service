import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import {
  AccessTokenPayload,
  TokenService,
} from '../../application/ports/token-service';

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly expiresIn: number;
  private readonly secret: string;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.expiresIn = config.get<number>('JWT_EXPIRES_IN_SECONDS', 3600);
    this.secret = config.getOrThrow<string>('JWT_SECRET');
  }

  sign(payload: AccessTokenPayload): Promise<string> {
    return this.jwt.signAsync(payload, {
      expiresIn: this.expiresIn,
      secret: this.secret,
    });
  }
}
