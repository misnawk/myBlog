// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS 설정 (기존 유지)
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:7000',
      'https://blog.minseok.life'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // 정적 파일 서빙 설정 개선
  app.useStaticAssets(join(__dirname, '..', '..', 'client', 'build'), {
    index: false,  // index.html 자동 서빙 비활성화
    setHeaders: (res, path) => {
      // 이미지 파일들의 올바른 Content-Type 설정
      if (path.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (path.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      // CORS 헤더도 추가
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
  });
  
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();