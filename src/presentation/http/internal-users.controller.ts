import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';

@Controller('internal/users')
@UseGuards(InternalApiKeyGuard)
export class InternalUsersController {
  constructor(private readonly getUser: GetCurrentUserUseCase) {}

  @Get(':id')
  find(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUser.execute(id);
  }
}
