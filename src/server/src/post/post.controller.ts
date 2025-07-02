import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./create-post.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";



@Controller('posts')
export class PostController{
    constructor(private readonly postService: PostService){}

    //게시글 생성
    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(@Body() postData: CreatePostDto, @Request() req) {
        return this.postService.createPost(postData, req.user.id);
    }

    //모든 게시글 조회
    @Get()
    async findAll() {
        return this.postService.findAll();
    }
    
}