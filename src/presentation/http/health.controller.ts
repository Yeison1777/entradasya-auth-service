import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../../infrastructure/database/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  liveness() {
    return this.response();
  }

  @Get('ready')
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.response({ database: 'up' });
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'auth-service',
        database: 'down',
        timestamp: new Date().toISOString(),
      });
    }
  }

  private response(extra: Record<string, string> = {}) {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      ...extra,
    };
  }
}
