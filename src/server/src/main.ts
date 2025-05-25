import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // CORS 설정
  app.enableCors();
  
  // 정적 파일 서빙 설정 (React 빌드 파일)
  app.useStaticAssets(join(__dirname, '..', '..', 'client', 'build'));
  
  // API 라우트 prefix 설정
  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
