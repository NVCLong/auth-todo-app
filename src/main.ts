import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ClusterService } from './cluster.service';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);
  // Using to document the app with swagger this using builder design pattern
  const config = new DocumentBuilder()
    .setTitle('Todo App')
    .setDescription('A simple Todo App')
    .setVersion('1.0')
    .addTag('todo')
    .addServer(
      'http://localhost:3000',
      'Local environment - Develop environment',
    )
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(helmet());

  app.use(cookieParser());
  await app.listen(3000);
}

bootstrap();
// ClusterService.clusterize(bootstrap)
