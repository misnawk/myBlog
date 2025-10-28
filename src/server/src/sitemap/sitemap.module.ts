import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitemapController } from './sitemap.controller';
import { SitemapService } from './sitemap.service';
import { Post } from '../post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [SitemapController],
  providers: [SitemapService],
})
export class SitemapModule {}
