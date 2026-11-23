export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('El correo ya está registrado.');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Correo o contraseña incorrectos.');
    this.name = 'InvalidCredentialsError';
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super('La cuenta está desactivada.');
    this.name = 'InactiveUserError';
  }
}

export class UserNotFoundError extends Error {
  constructor() {
    super('El usuario no existe.');
    this.name = 'UserNotFoundError';
  }
}
