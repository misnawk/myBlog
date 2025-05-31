import { Injectable } from "@nestjs/common";
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
    async findByUsername(username:string):Promise<User | null>{
        return this.userRepository.findOne({ where: { username } }) 
    }

    // 이메일로 찾기
    async findByEmail(email:string):Promise<User | null>{
        return this.userRepository.findOne({ where: { email } })
    }

    // ID로 찾기
    async findById(id:number):Promise<User | null>{
        return this.userRepository.findOne({ where: { id } })
    }

    // 비밀번호 검증
    async validatePassword(plainPassword:string, hashedPassword:string):Promise<boolean>{
        return bcrypt.compare(plainPassword,hashedPassword);
    }
}