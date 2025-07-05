import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private configService: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'asdfasdfsdafwersag',
        });
    }

    async validate(payload: any){
        console.log("=== JWT 토큰 검증 시작 ===");
        console.log("토큰 페이로드:", {
            sub: payload.sub,
            email: payload.email,
            username: payload.username,
            iat: payload.iat ? new Date(payload.iat * 1000).toISOString() : '없음',
            exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : '없음'
        });
        
        const user = {id: payload.sub, email: payload.email, username: payload.username};
        console.log("검증된 사용자:", user);
        console.log("=== JWT 토큰 검증 완료 ===");
        
        return user;
    }
}