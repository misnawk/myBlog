import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // 요청 크기 제한 설정 (이미지 포함 콘텐츠 처리를 위해)
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

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
