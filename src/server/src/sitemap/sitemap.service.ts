import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../post/post.entity';

@Injectable()
export class SitemapService {
  private readonly baseUrl = 'https://blog.minseok.life';

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  /**
   * 날짜를 YYYY-MM-DD 형식으로 변환
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async generateSitemap(): Promise<string> {
    // 데이터베이스에서 모든 게시글 가져오기 (최신순)
    const posts = await this.postRepository.find({
      order: { updatedAt: 'DESC' },
    });

    // 정적 페이지 목록
    const staticPages = [
      { url: '/', priority: '1.0' },           // 홈페이지 (가장 중요)
      { url: '/blog', priority: '0.8' },       // 블로그 목록
      { url: '/login', priority: '0.5' },      // 일반 페이지
      { url: '/register', priority: '0.5' },   // 일반 페이지
    ];

    // 현재 날짜 (정적 페이지 lastmod용)
    const today = this.formatDate(new Date());

    // XML 시작
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n';

    // 정적 페이지 추가
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${this.baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n\n';
    }

    // 블로그 게시글 추가 (동적으로 생성)
    for (const post of posts) {
      xml += '  <url>\n';
      xml += `    <loc>${this.baseUrl}/blog/${post.id}</loc>\n`;
      xml += `    <lastmod>${this.formatDate(post.updatedAt)}</lastmod>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += '  </url>\n\n';
    }

    xml += '</urlset>';

    return xml;
  }

  generateRobotsTxt(): string {
    return `# https://blog.minseok.life/robots.txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${this.baseUrl}/sitemap.xml
`;
  }
}
