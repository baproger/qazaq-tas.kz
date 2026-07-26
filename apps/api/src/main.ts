import 'reflect-metadata';
import helmet from '@fastify/helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ trustProxy: true, bodyLimit: 25 * 1024 * 1024 }),
  );

  const config = app.get(ConfigService);
  const port = Number(config.get('API_PORT') ?? 3001);
  const prefix = config.get<string>('API_PREFIX') ?? 'api';
  const corsOrigin = (config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000').split(',');

  // Защитные HTTP-заголовки. CSP отключена: интерфейс отдаёт Next.js на другом хосте.
  await app.register(helmet, { contentSecurityPolicy: false });

  app.setGlobalPrefix(prefix);
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableShutdownHooks();

  // Документация API доступна только вне продакшена
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('QAZAQ TAS ERP API')
      .setDescription('API единой системы управления компанией QAZAQ TAS GROUP')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(`${prefix}/docs`, app, SwaggerModule.createDocument(app, swaggerConfig));
  }

  await app.listen({ port, host: '0.0.0.0' });

  const logger = new Logger('Bootstrap');
  logger.log(`API запущен: http://localhost:${port}/${prefix}`);
  logger.log(`Документация:  http://localhost:${port}/${prefix}/docs`);
}

void bootstrap();
