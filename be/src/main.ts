import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import * as timeout from 'connect-timeout';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Request timeout (30 seconds)
  app.use(timeout('30s'));
  
  // Security headers with Helmet - configured for GraphQL
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );
  
  // Enable global validation pipe with less strict settings
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strip properties that don't have decorators
    forbidNonWhitelisted: false, // Changed to false - don't throw errors for extra properties
    transform: true, // Automatically transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true, // Convert primitive types automatically
    },
  }));
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });


  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`GraphQL endpoint: http://localhost:${process.env.PORT ?? 3000}/graphql`);


}
bootstrap();
