import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { BusinessCaseService } from './business-case.service.js';
import { BusinessCasePreviewDto } from './dto/business-case-preview.dto.js';

@ApiTags('Business Case')
@Controller({
  path: 'business-case',
  version: '1',
})
export class BusinessCaseController {
  constructor(private readonly businessCaseService: BusinessCaseService) {}

  @Get('health')
  @ApiOperation({ summary: 'Business-case module health check' })
  health() {
    return { status: 'ok' };
  }

  @Post('preview')
  @ApiOperation({ summary: 'Run deterministic business-case preview from worksheet input' })
  preview(@Body() payload: BusinessCasePreviewDto) {
    return this.businessCaseService.preview(payload);
  }
}
