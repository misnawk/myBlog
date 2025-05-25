import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // React 앱의 모든 라우트를 처리하기 위한 fallback
  @Get('*')
  serveApp(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', '..', 'client', 'build', 'index.html'));
  }
}
