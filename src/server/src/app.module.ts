import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; //환경변수와 설정값을 안전하게 관리하고 접근 할때 사용하는 함수
import { AppController } from './app.controller';
import { AppService } from './app.service';
import{AuthModule} from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath 제거 - 환경변수는 시스템에서 직접 로드
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
       // synchronize: true, // 개발환경에서만 사용
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}