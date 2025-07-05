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
        console.log("=== 게시글 생성 요청 시작 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("사용자 정보:", req.user);
        console.log("사용자 이메일:", req.user?.email);
        console.log("게시글 데이터:", {
            title: postData.title,
            category: postData.category,
            contentLength: postData.content?.length || 0,
            contentPreview: postData.content?.substring(0, 100) + "..."
        });
        
        try {
            const result = await this.postService.createPost(postData, req.user.email);
            console.log("게시글 생성 성공:", result.id);
            console.log("=== 게시글 생성 완료 ===");
            return result;
        } catch (error) {
            console.error("게시글 생성 실패:", error.message);
            console.error("=== 게시글 생성 오류 ===");
            throw error;
        }
    }

    //모든 게시글 조회 (공개 - 인증 불필요)
    @Get('postAll')
    async findAll() {
        console.log("=== 모든 게시글 조회 요청 ===");
        console.log("요청 시간:", new Date().toISOString());
        
        try {
            const result = await this.postService.findAll();
            console.log("게시글 조회 성공, 총 개수:", result.length);
            return result;
        } catch (error) {
            console.error("게시글 조회 실패:", error.message);
            throw error;
        }
    }

    //개별 게시글 조회 (공개 - 인증 불필요)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        console.log("=== 개별 게시글 조회 요청 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("게시글 ID:", id);
        
        try {
            const result = await this.postService.findOne(+id);
            console.log("게시글 조회 성공:", result?.title);
            return result;
        } catch (error) {
            console.error("게시글 조회 실패:", error.message);
            throw error;
        }
    }
    
}