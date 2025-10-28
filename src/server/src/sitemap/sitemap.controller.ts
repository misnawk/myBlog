import { Controller, Get, Header } from '@nestjs/common';
import { SitemapService } from './sitemap.service';

@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'text/xml')
  async getSitemap() {
    return this.sitemapService.generateSitemap();
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  getRobotsTxt() ㅇ{
    return this.sitemapService.generateRobotsTxt();
  }
}
