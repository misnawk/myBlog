import { Body, Controller, Get, Post, Request, UseGuards, Param } from "@nestjs/common";
import { PostService } from "./post.service";
import { CreatePostDto } from "./create-post.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";



@Controller('posts')
export class PostController{
    constructor(private readonly postService: PostService){}

    //게시글 생성
    @Post('write')
    @UseGuards(JwtAuthGuard)
    async createPost(@Body() postData: CreatePostDto, @Request() req) {
        console.log("req.user" + req.user.email);
        return this.postService.createPost(postData, req.user.email);
    }

    //모든 게시글 조회
    @Get('postAll')
    @UseGuards(JwtAuthGuard)
    async findAll() {
        return this.postService.findAll();
    }

    //개별 게시글 조회
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id') id: string) {
        return this.postService.findOne(+id);
    }
    
}