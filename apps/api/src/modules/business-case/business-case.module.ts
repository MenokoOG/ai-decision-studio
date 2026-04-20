import { Module } from '@nestjs/common';

import { BusinessCaseController } from './business-case.controller.js';
import { BusinessCaseService } from './business-case.service.js';

@Module({
    controllers: [BusinessCaseController],
    providers: [BusinessCaseService],
})
export class BusinessCaseModule { }
