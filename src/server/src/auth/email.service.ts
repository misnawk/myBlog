import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    // Gmail SMTP 설정 (실제로는 환경 변수로 관리해야 함)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'minsukkang13@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'omzi bmei auoq usyn'
      }
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: '이메일 인증 코드',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">이메일 인증 코드</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="font-size: 16px; color: #666;">아래 인증 코드를 입력해주세요:</p>
            <div style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="font-size: 14px; color: #888;">이 코드는 10분 후 만료됩니다.</p>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 20px;">
            본인이 요청하지 않은 경우 이 메일을 무시하세요.
          </p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('✅ 인증 코드 이메일 발송 성공:', email);
    } catch (error) {
      console.error('❌ 인증 코드 이메일 발송 실패:', error);
      throw new Error('이메일 발송에 실패했습니다.');
    }
  }

  // 인증 코드 생성 (6자리 숫자)
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
} 