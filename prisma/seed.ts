import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { PrismaClient, UserRole } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL es obligatoria para ejecutar el seed.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const initialUsers = [
  {
    name: 'Organizador Demo',
    email: process.env.SEED_ORGANIZER_EMAIL ?? 'organizador@entradasya.local',
    password: process.env.SEED_ORGANIZER_PASSWORD ?? 'Organizador123!',
    role: UserRole.ORGANIZER,
  },
  {
    name: 'Portero Demo',
    email: process.env.SEED_DOOR_STAFF_EMAIL ?? 'portero@entradasya.local',
    password: process.env.SEED_DOOR_STAFF_PASSWORD ?? 'Portero123!',
    role: UserRole.DOOR_STAFF,
  },
  {
    name: 'Cliente Demo',
    email: process.env.SEED_CLIENT_EMAIL ?? 'cliente@entradasya.local',
    password: process.env.SEED_CLIENT_PASSWORD ?? 'Cliente123!',
    role: UserRole.CLIENT,
  },
];

async function main() {
  const seededUsers = new Map<UserRole, string>();

  for (const user of initialUsers) {
    const seeded = await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: {
        name: user.name,
        passwordHash: await argon2.hash(user.password),
        role: user.role,
        active: true,
      },
      create: {
        name: user.name,
        email: user.email.toLowerCase(),
        passwordHash: await argon2.hash(user.password),
        role: user.role,
      },
    });
    seededUsers.set(user.role, seeded.id);
  }

  const storagePath = resolve(process.cwd(), '../../storage');
  await mkdir(storagePath, { recursive: true });
  await writeFile(
    resolve(storagePath, 'demo-seed.json'),
    `${JSON.stringify(
      {
        organizerId: seededUsers.get(UserRole.ORGANIZER),
        doorStaffId: seededUsers.get(UserRole.DOOR_STAFF),
        clientId: seededUsers.get(UserRole.CLIENT),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );

  console.info(`Seed de autenticación listo: ${initialUsers.length} usuarios.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
