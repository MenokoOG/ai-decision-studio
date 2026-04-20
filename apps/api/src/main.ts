import 'reflect-metadata';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';
import { env } from './config/env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AI Decision Studio API')
    .setDescription('Versioned API for AI Decision Studio business-case workflows.')
    .setVersion('1.0.0')
    .addServer(`http://localhost:${env.API_PORT}`)
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
    },
  });

  await app.listen(env.API_PORT, env.API_HOST);

  const logger = new Logger('Bootstrap');
  logger.log(`API listening on http://${env.API_HOST}:${env.API_PORT}`);
  logger.log(`Swagger docs available at http://${env.API_HOST}:${env.API_PORT}/api/docs`);
}

void bootstrap();
