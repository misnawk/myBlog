import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    constructor(private configService: ConfigService){
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        console.log("=== JWT 인증 가드 실행 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("요청 경로:", request.url);
        console.log("요청 메서드:", request.method);
        
        const authHeader = request.headers.authorization;
        console.log("Authorization 헤더:", authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : '없음');
        
        try {
            const result = await super.canActivate(context) as boolean;
            console.log("JWT 인증 성공");
            console.log("인증된 사용자:", request.user?.email);
            console.log("=== JWT 인증 완료 ===");
            return result;
        } catch (error) {
            console.error("=== JWT 인증 실패 ===");
            console.error("인증 오류:", error.message);
            console.error("토큰 상태:", authHeader ? '토큰 있음 (유효하지 않음)' : '토큰 없음');
            throw error;
        }
    }
}