import type { RequestHandler } from 'express';
import { randomUUID } from 'node:crypto';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export const requestIdMiddleware: RequestHandler = (request, response, next) => {
  const existingHeader = request.header('x-request-id');
  const requestId = existingHeader && existingHeader.length > 0 ? existingHeader : randomUUID();

  request.requestId = requestId;
  response.setHeader('x-request-id', requestId);
  next();
};
