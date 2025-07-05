import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // 요청 크기 제한 설정 (이미지 포함 콘텐츠 처리를 위해)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:7000', 
      'https://blog.minseok.life'
    ],
    credentials: true,
  });

  // SPA 라우팅 지원을 위한 fallback 미들웨어
  app.use((req, res, next) => {
    // API 요청이 아니고, 파일 확장자가 없는 경우 index.html로 리다이렉트
    if (!req.url.startsWith('/api') && !req.url.includes('.')) {
      const indexPath = join(__dirname, '..', '..', 'client', 'build', 'index.html');
      res.sendFile(indexPath);
    } else {
      next();
    }
  });

  const port = 7000; 

  await app.listen(port);
  console.log(`=== 서버 시작 완료 ===`);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`시작 시간: ${new Date().toISOString()}`);
}

bootstrap();
