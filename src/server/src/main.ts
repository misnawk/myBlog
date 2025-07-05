import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

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

  const port = 7000; 

  await app.listen(port);
  console.log(`=== 서버 시작 완료 ===`);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`시작 시간: ${new Date().toISOString()}`);
}

bootstrap();
