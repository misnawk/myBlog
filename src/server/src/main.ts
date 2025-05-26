import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 개선된 CORS 설정
  app.enableCors({
    origin: true,  // 모든 오리진 허용 (테스트용)
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
  
  // 정적 파일 서빙 설정 (React 빌드 파일)
  app.useStaticAssets(join(__dirname, '..', '..', 'client', 'build'));
  
  // API 라우트 prefix 설정
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 7000);
}
bootstrap();
