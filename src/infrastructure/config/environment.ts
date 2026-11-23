export interface EnvironmentVariables {
  PORT: number;
  WEB_ORIGIN: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN_SECONDS: number;
  INTERNAL_API_KEY: string;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const databaseUrl = readString(config.DATABASE_URL);
  const jwtSecret = readString(config.JWT_SECRET);
  const internalApiKey = readString(config.INTERNAL_API_KEY);

  if (!databaseUrl.startsWith('postgresql://')) {
    throw new Error('DATABASE_URL debe ser una URL válida de PostgreSQL.');
  }

  if (jwtSecret.length < 24) {
    throw new Error('JWT_SECRET debe tener al menos 24 caracteres.');
  }
  if (internalApiKey.length < 24) {
    throw new Error('INTERNAL_API_KEY debe tener al menos 24 caracteres.');
  }

  return {
    PORT: readNumber(config.PORT, 3001),
    WEB_ORIGIN: readString(config.WEB_ORIGIN, 'http://localhost:5173'),
    DATABASE_URL: databaseUrl,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN_SECONDS: readNumber(config.JWT_EXPIRES_IN_SECONDS, 3600),
    INTERNAL_API_KEY: internalApiKey,
  };
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function readNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === 'string' || typeof value === 'number'
      ? Number(value)
      : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}
