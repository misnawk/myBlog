import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:7000', 
      'https://blog.minseok.life'
    ],
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'development') {
    app.useStaticAssets(join(__dirname, '..', '..', 'client', 'build'));
  
  }

  const port = 7000; 

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
