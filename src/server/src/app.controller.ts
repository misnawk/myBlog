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

  // 특정 SPA 라우트들만 처리
  @Get(['blog', 'create', 'login', 'register', 'categories', 'blogDetail/:id', 'edit/:id'])
  serveSPA(@Res() res: Response): void {
    const indexPath = join(__dirname, '..', '..', 'client', 'build', 'index.html');
    console.log(`SPA 라우트 요청 → index.html 제공`);
    res.sendFile(indexPath);
  }
} 