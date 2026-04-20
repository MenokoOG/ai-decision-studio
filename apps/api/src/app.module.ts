import { Module } from '@nestjs/common';

import { BusinessCaseModule } from './modules/business-case/business-case.module.js';
import { InitiativesModule } from './modules/initiatives/initiatives.module.js';

@Module({
  imports: [BusinessCaseModule, InitiativesModule],
})
export class AppModule {}
