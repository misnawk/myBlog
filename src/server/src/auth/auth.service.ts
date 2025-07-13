import{ConflictException, Injectable, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendVerificationDto } from './dto/send-verification.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { User } from 'src/user/user.entity';
import { EmailService } from './email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './email-verification.entity';


@Injectable()
export class AuthService{
    constructor(
        private userService:UserService,
        private jwtService:JwtService,
        private emailService:EmailService,
        @InjectRepository(EmailVerification)
        private emailVerificationRepository: Repository<EmailVerification>,
    ){}

    // 인증 코드 발송
    async sendVerificationCode(sendVerificationDto: SendVerificationDto) {
        const { email } = sendVerificationDto;
        
        // 이미 가입된 이메일인지 확인
        const existingUser = await this.userService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('이미 가입된 이메일입니다.');
        }

        // 기존 인증 코드가 있다면 삭제
        await this.emailVerificationRepository.delete({ email });

        // 새 인증 코드 생성
        const code = this.emailService.generateVerificationCode();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10분 후 만료

        // 인증 코드 저장
        const verification = this.emailVerificationRepository.create({
            email,
            code,
            expiresAt,
        });
        await this.emailVerificationRepository.save(verification);

        // 이메일 발송
        await this.emailService.sendVerificationCode(email, code);

        return {
            message: '인증 코드가 이메일로 발송되었습니다.',
            email,
        };
    }

    // 이메일 인증 코드 검증
    async verifyEmail(verifyEmailDto: VerifyEmailDto) {
        const { email, code } = verifyEmailDto;

        // 인증 코드 조회
        const verification = await this.emailVerificationRepository.findOne({
            where: { email, code, isUsed: false },
        });

        if (!verification) {
            throw new BadRequestException('유효하지 않은 인증 코드입니다.');
        }

        // 만료 시간 확인
        if (new Date() > verification.expiresAt) {
            throw new BadRequestException('인증 코드가 만료되었습니다.');
        }

        // 인증 코드 사용 처리
        verification.isUsed = true;
        await this.emailVerificationRepository.save(verification);

        return {
            message: '이메일 인증이 완료되었습니다.',
            email,
            verified: true,
        };
    }

    // 이메일 인증 여부 확인
    async checkEmailVerification(email: string): Promise<boolean> {
        const verification = await this.emailVerificationRepository.findOne({
            where: { email, isUsed: true },
            order: { createdAt: 'DESC' },
        });

        return !!verification;
    }

    //회원가입
    async register(registerDto:RegisterDto){
       try {
            // 이메일 인증 완료 여부 확인
            const isVerified = await this.checkEmailVerification(registerDto.email);
            if (!isVerified) {
                throw new BadRequestException('이메일 인증이 완료되지 않았습니다.');
            }

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

            // 회원가입 성공 후 인증 코드 삭제
            await this.emailVerificationRepository.delete({ email: registerDto.email });

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

            if(error instanceof ConflictException || error instanceof BadRequestException){
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