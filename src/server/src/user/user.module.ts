import { Module } from "@nestjs/common";
import { UserService } from "./user.service";


@Module({
    providers:[UserService],
    exports:[UserService], // 다른 모듈에서 사용할수 있도록 내보낸다.
})
export class UserModule{};