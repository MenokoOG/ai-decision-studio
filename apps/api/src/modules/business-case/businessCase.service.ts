import { evaluateBusinessCase } from '@ai-cost-tool/calculators/src/businessCase';

import type { BusinessCasePreviewPayload } from './businessCase.schema.js';

export class BusinessCaseService {
  preview(input: BusinessCasePreviewPayload) {
    return evaluateBusinessCase(input);
  }
}

export const businessCaseService = new BusinessCaseService();
