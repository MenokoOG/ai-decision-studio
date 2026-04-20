import { Router } from 'express';

import { businessCaseRouter } from '../modules/business-case/businessCase.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok' });
});

apiRouter.use('/business-case', businessCaseRouter);
