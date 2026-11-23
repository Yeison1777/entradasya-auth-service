import { UserRole } from '../../domain/user-role';

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface AccessTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface TokenService {
  sign(payload: AccessTokenPayload): Promise<string>;
}
