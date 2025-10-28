import { Controller, Get, Header } from '@nestjs/common';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'text/xml')
  async getSitemap() {
    console.log('=== Sitemap 생성 요청 ===');
    console.log('요청 시간:', new Date().toISOString());
    return this.sitemapService.generateSitemap();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  getRobotsTxt() {
    return this.sitemapService.generateRobotsTxt();
  }
}
