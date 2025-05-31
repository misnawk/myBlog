import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // API 라우트 prefix 설정을 먼저 해야 함
  app.setGlobalPrefix('api');
  
  // 개선된 CORS 설정
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://blog.minseok.life',  // HTTPS만
      'http://localhost:7000',      // 개발환경용
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With'
    ],
    credentials: true,  // 쿠키/인증 정보 허용
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
  
  // 정적 파일 서빙을 일시적으로 제거하여 API 테스트
  // app.useStaticAssets(join(__dirname, '..', '..', 'client', 'build'));
  
  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
