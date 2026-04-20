import { Router } from 'express';

import { validateBody } from '../../shared/validateBody.js';
import { businessCaseController } from './businessCase.controller.js';
import { businessCasePreviewSchema } from './businessCase.schema.js';

export const businessCaseRouter = Router();

businessCaseRouter.post('/preview', validateBody(businessCasePreviewSchema), businessCaseController.preview);
