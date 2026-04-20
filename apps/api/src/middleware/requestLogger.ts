import type { RequestHandler } from 'express';

export const requestLoggerMiddleware: RequestHandler = (request, _response, next) => {
  const startedAt = Date.now();

  request.on('close', () => {
    const elapsedMs = Date.now() - startedAt;
    const statusCode = request.res?.statusCode ?? 0;

    console.log(
      JSON.stringify({
        type: 'http.request',
        requestId: request.requestId ?? null,
        method: request.method,
        path: request.originalUrl,
        statusCode,
        elapsedMs,
      }),
    );
  });

  next();
};
