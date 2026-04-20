import type { ErrorRequestHandler } from 'express';

import { env } from '../config/env.js';
import { HttpError } from '../shared/httpError.js';

export const errorHandlerMiddleware: ErrorRequestHandler = (error, request, response, _next) => {
    const httpError = error instanceof HttpError ? error : new HttpError(500, 'Internal Server Error');

    if (httpError.statusCode >= 500) {
        console.error(
            JSON.stringify({
                type: 'http.error',
                requestId: request.requestId ?? null,
                method: request.method,
                path: request.originalUrl,
                message: error instanceof Error ? error.message : 'Unknown error',
            }),
        );
    }

    response.status(httpError.statusCode).json({
        error: {
            message: httpError.message,
            details: httpError.details,
            requestId: request.requestId ?? null,
            ...(env.NODE_ENV !== 'production' && error instanceof Error ? { stack: error.stack } : {}),
        },
    });
};
