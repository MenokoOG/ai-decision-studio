import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { InitiativesController } from './initiatives.controller.js';
import { InitiativesService } from './initiatives.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [InitiativesController],
  providers: [InitiativesService],
})
export class InitiativesModule {}
