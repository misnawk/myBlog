import { Controller,Post, Body } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { SendVerificationDto } from "./dto/send-verification.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";



@Controller('auth')

export class AuthController{

    constructor(private authService:AuthService){}

    // 인증 코드 발송
    @Post('send-verification-code')
    async sendVerificationCode(@Body() sendVerificationDto: SendVerificationDto) {
        return this.authService.sendVerificationCode(sendVerificationDto);
    }

    // 이메일 인증 코드 검증
    @Post('verify-email')
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
        return this.authService.verifyEmail(verifyEmailDto);
    }

    //회원가입
    @Post('register')
    async register(@Body() RegisterDto:RegisterDto){
        return this.authService.register(RegisterDto);
    }
    //로그인
    @Post('login')
    async login(@Body() LoginDto:LoginDto){
        return this.authService.login(LoginDto);
    }
}