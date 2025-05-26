import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports:[TypeOrmModule.forFeature([User])], //테이블 조작을 위해서 추가
    providers:[UserService],
    exports:[UserService], // 다른 모듈에서 사용할수 있도록 내보낸다.
})
export class UserModule{};