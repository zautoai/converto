import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './common/middlewares/logger.middleware';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: process.env.REDIS_IP,
      port: +process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
    },
  });   
  // CORS 
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  });

  // version contole
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // logger middleware
  app.use(logger);

  const config = new DocumentBuilder()
    .setTitle('Convorto CRM')
    .setDescription('') 
    .setVersion('1.0')
    .addBearerAuth()

    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    jsonDocumentUrl: '/api/v1/docs/json'
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.startAllMicroservices();
  await app.listen(process.env.HOST_PORT || 3000);
}
bootstrap();
