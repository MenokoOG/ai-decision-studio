import { Injectable } from '@nestjs/common';

import { evaluateBusinessCase } from '@ai-cost-tool/calculators/src/businessCase';

import type { BusinessCasePreviewDto } from './dto/business-case-preview.dto.js';

@Injectable()
export class BusinessCaseService {
  preview(input: BusinessCasePreviewDto) {
    return evaluateBusinessCase(input);
  }
}
