import { Controller,Post, Body } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";



@Controller('auth')

export class AuthController{

    constructor(private authService:AuthService){}

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