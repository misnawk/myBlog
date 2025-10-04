import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; //환경변수와 설정값을 안전하게 관리하고 접근 할때 사용하는 함수
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath 제거 - 환경변수는 시스템에서 직접 로드
    }),
    // React 정적 파일 서빙 설정 추가
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'build'),
      exclude: ['/api*'], // API 경로는 제외
      serveRoot: '/', // 루트 경로에서 서빙
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false, 
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}