import { Module } from "@nestjs/common";
import { CategoryService } from "./Category.Service";
import { CategoryController } from "./Category.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "./Category.entity";
import { Post } from "../post/post.entity";


@Module({
    imports: [TypeOrmModule.forFeature([Category, Post])],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}