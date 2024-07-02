import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Redis } from 'ioredis';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {

  const redis = new Redis({
    host: process.env.REDIS_IP, 
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD
  });  


  redis.on('connect', async () => {
    console.log('Connected to Redis');

    // Only start NestJS app if Redis connection is successful

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'debug', 'log', 'verbose'],
    });

    app.connectMicroservice({
      transport: Transport.REDIS,
      options: {
        host:process.env.REDIS_IP,
        port:+process.env.REDIS_PORT,
        password:process.env.REDIS_PASSWORD
      },
    }); 
  
    //Validator
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));
  
    app.enableCors({
      origin: '*', // Replace with your frontend's origin
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  
    //Swagger Docs
    const config = new DocumentBuilder()
    .setTitle('ZautoAI API')
    .setDescription('ZautoAI API')
    .setVersion('1.0')
    .addTag('ZautoAI')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' },'x-tenant-id')
    .build()

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    await app.startAllMicroservices();
    await app.listen(process.env.HOST_PORT || 3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
  });

  redis.on('error', (err) => {
    console.error('Error connecting to Redis', err);
  });
  
}

bootstrap();
