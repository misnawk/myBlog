import { Module } from "@nestjs/common";
import { CategoryService } from "./Category.Service";
import { CategoryController } from "./Category.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./Category.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Category])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}