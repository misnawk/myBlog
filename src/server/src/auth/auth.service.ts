import{ConflictException, Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/user/user.entity';


@Injectable()
export class AuthService{
    constructor(
        private userService:UserService,
        private jwtService:JwtService,
    ){}

    
    //회원가입
    async register(registerDto:RegisterDto){
       try {
        
            const existingEmail = await this.userService.findByEmail(registerDto.email);
                if(existingEmail){
                    throw new ConflictException('이미 존재하는 이메일입니다.');
                }
 
            //이메일 검증이 끝나면
            const user = await this.userService.create(
                registerDto.username,
                registerDto.email,
                registerDto.password
                )

            return{
                message: '회원가입에 성공했습니다.',
                user:{
                    id:user.id,
                    username:user.username,
                    email:user.email
                    },
                };

       } catch (error) {
            if(error.code ==='ER_DUP_ENTRY'){
                throw new ConflictException('이미 존재하는 이메일입니다.');
            }

            if(error instanceof ConflictException){
                throw error;
            }
            
       }

    }
    

    // 로그인 
    async login(loginDto: LoginDto){
        console.log('로그인 시도:', loginDto.email);
        
        //DB에서 이메일로 사용자 정보 가져옴
        const user = await this.userService.findByEmail(loginDto.email);
        console.log('사용자 조회 결과:', user ? '찾음' : '없음');

        if(!user){
            console.log('사용자 없음 - 회원가입 필요');
            throw new UnauthorizedException('가입 되어있지 않은 사용자입니다.');
        }

        //입력한 PW 와 DB에 있는 PW 대조
        const isPasswordValid = await this.userService.validatePassword(
            loginDto.password,
            user.password
        );
        console.log('비밀번호 검증 결과:', isPasswordValid);

        if(!isPasswordValid){
            console.log('비밀번호 불일치');
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }

        //JWT 토큰 생성
        const payload = {email:user.email, id:user.id , username:user.username};
        const access_token = this.jwtService.sign(payload);
        console.log('로그인 성공, 토큰 생성 완료');

        return{
            access_token: access_token,
            user:{
                id:user.id,
                username:user.username,
                email:user.email
            },
        };
    }
}