import type { RequestHandler } from 'express';
import type { AnyZodObject } from 'zod';

import { HttpError } from './httpError.js';

export function validateBody<TSchema extends AnyZodObject>(schema: TSchema): RequestHandler {
  return (request, _response, next) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      next(new HttpError(400, 'Request validation failed', parsed.error.format()));
      return;
    }

    request.body = parsed.data;
    next();
  };
}
