import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { User } from "./user.entity";
import * as bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class UserService {
    
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    private users: User[] = [];

    // 사용자 생성
    async create(username:string, email:string, password:string): Promise<User>{
        
        // 비밀번호를 해싱 10은 솔트라운드를 의미함
        const hashedPassword = await bcrypt.hash(password,10);
        
        // 새 사용자를 생성
        const user = this.userRepository.create({
            username,
            email,
            password: hashedPassword,
        })
        return this.userRepository.save(user);
    }

    // 사용자명으로 찾기
    async findByUsername(username:string):Promise<User | undefined>{
        return this.users.find(user=>user.username === username);
    }

    // 이메일로 찾기
    async findByEmail(email:string):Promise<User | undefined>{
        try {
          const user = await this.userRepository.findOne({where: {email}});
          console.log("DB에서 사용자 정보 가져옴" + user?.email);
          return user || undefined; 
        } catch (error) {
            throw new InternalServerErrorException('사용자 조회에 실패했습니다.');
        }
    }

    // ID로 찾기
    async findById(id:number):Promise<User | undefined>{
        return this.users.find(user=>user.id === id);
    }

    // 비밀번호 검증
    async validatePassword(plainPassword:string, hashedPassword:string):Promise<boolean>{
        return bcrypt.compare(plainPassword,hashedPassword);
    }
}