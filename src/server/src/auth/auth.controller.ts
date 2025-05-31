import { Controller, Post, Body, Get, Request, UnauthorizedException, Headers } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";

@Controller('auth')
export class AuthController{

    constructor(
        private authService: AuthService,
        private jwtService: JwtService,
        private userService: UserService
    ){}

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

    //토큰검증 - 서비스 방식
    @Get('verify')
    async verifyToken(@Headers('Authorization') authHeader: string){
        try {
            console.log("토큰 검증 시작");
            console.log("authHeader:", authHeader);
            // 1. Authorization 헤더 확인

            if (!authHeader) {
                throw new UnauthorizedException('토큰이 없습니다.');
            }

            // 2. Bearer 토큰 추출
            const token = authHeader.split(' ')[1];
            console.log("추출된 토큰:", token);
            if (!token) {
                throw new UnauthorizedException('토큰 형식이 올바르지 않습니다.');
            }

            // 3. JWT 토큰 검증
            const payload = await this.jwtService.verifyAsync(token);

            // 4. DB에서 사용자 존재 확인
            const user = await this.userService.findByEmail(payload.email);
            if (!user) {
                throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
            }

            // 5. 성공 응답
            return {
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username
                }
            };

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('유효하지 않은 토큰입니다.');
        }
    }
}