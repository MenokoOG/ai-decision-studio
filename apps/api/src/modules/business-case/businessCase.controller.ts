import type { RequestHandler } from 'express';

import { businessCaseService } from './businessCase.service.js';
import type { BusinessCasePreviewPayload } from './businessCase.schema.js';

class BusinessCaseController {
  preview: RequestHandler = (request, response) => {
    const payload = request.body as BusinessCasePreviewPayload;
    const result = businessCaseService.preview(payload);

    response.status(200).json(result);
  };
}

export const businessCaseController = new BusinessCaseController();
