# auth-service

Servicio de usuarios y autenticación de EntradasYa. Expone registro de clientes, inicio de sesión, perfil autenticado y tokens JWT para los demás servicios.

## Requisitos

- Node.js 24 o posterior.
- pnpm 11 o posterior.
- PostgreSQL 17 o compatible.
- Una base `auth_db` accesible exclusivamente por `auth_user`.

## Configuración

El archivo `.env` local ya contiene valores de desarrollo. Antes de crear la base, cambia `change-me` por una contraseña local en estos dos archivos:

- `apps/auth-service/.env`
- `scripts/database/01-create-auth-database.sql`

No publiques el archivo `.env`; está excluido mediante `.gitignore`.

## Crear la base

Desde la raíz del repositorio, inicia sesión con tu usuario administrador y ejecuta:

```powershell
psql -U TU_USUARIO_ADMIN -d postgres -f scripts/database/01-create-auth-database.sql
```

Desde la raíz del repositorio, aplica la migración y crea las cuentas iniciales:

```bash
pnpm db:auth:deploy
pnpm db:auth:seed
```

Las cuentas predeterminadas se definen mediante variables `SEED_*` dentro del `.env`: organizador, portero y cliente. El seed usa `upsert`, por lo que actualizará esas cuentas sin duplicarlas.

## Ejecutar

Desde la raíz:

```bash
pnpm --filter auth-service dev
```

El servicio escucha en `http://localhost:3001`.

## Endpoints

### Registro

```http
POST /auth/register
Content-Type: application/json
```

```json
{
  "name": "Ana Cliente",
  "email": "ana@example.com",
  "password": "Password123"
}
```

### Inicio de sesión

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "email": "ana@example.com",
  "password": "Password123"
}
```

Registro y login devuelven:

```json
{
  "accessToken": "jwt",
  "user": {
    "id": "uuid",
    "name": "Ana Cliente",
    "email": "ana@example.com",
    "role": "CLIENT",
    "active": true,
    "createdAt": "2026-11-17T00:00:00.000Z",
    "updatedAt": "2026-11-17T00:00:00.000Z"
  }
}
```

### Perfil

```http
GET /auth/me
Authorization: Bearer <token>
```

### Salud

- `GET /health/live`: confirma que el proceso funciona.
- `GET /health/ready`: comprueba la conexión a PostgreSQL.

## Comandos

```bash
pnpm --filter auth-service build
pnpm --filter auth-service lint
pnpm --filter auth-service test
pnpm --filter auth-service test:e2e
pnpm db:auth:generate
pnpm db:auth:deploy
pnpm db:auth:seed
```
