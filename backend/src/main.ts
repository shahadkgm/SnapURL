import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for the frontend app (supports multiple comma-separated URLs or wildcard)
  const frontendEnv = process.env.FRONTEND_URL;
  const allowedOrigins = frontendEnv
    ? frontendEnv.split(',').map((url) => url.trim().replace(/\/$/, ''))
    : ['http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins,
    credentials: true,
  });

  // Enable global DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties that are not in the DTO
      forbidNonWhitelisted: true, // throws error if extra properties are sent
      transform: true, // automatically transforms payloads to DTO instances
    }),
  );

  const port = process.env.PORT ?? 3000;
  // Listen on 0.0.0.0 for cloud hosting environments (Render, Railway, etc.)
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on port ${port}`);
}
await bootstrap();
