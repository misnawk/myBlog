import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    // 댓글 생성 (인증 필요)
    @Post()
    @UseGuards(JwtAuthGuard)
    async createComment(@Body() createCommentDto: CreateCommentDto, @Request() req) {
        console.log("=== 댓글 생성 요청 시작 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("사용자 이메일:", req.user?.email);
        console.log("댓글 데이터:", createCommentDto);

        try {
            const result = await this.commentService.createComment(createCommentDto, req.user.email);
            console.log("댓글 생성 성공:", result.id);
            console.log("=== 댓글 생성 완료 ===");
            return result;
        } catch (error) {
            console.error("댓글 생성 실패:", error.message);
            console.error("=== 댓글 생성 오류 ===");
            throw error;
        }
    }

    // 특정 게시글의 댓글 조회 (공개)
    @Get('post/:postId')
    async getCommentsByPost(@Param('postId') postId: string) {
        console.log("=== 댓글 조회 요청 시작 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("게시글 ID:", postId);

        try {
            const result = await this.commentService.getCommentsByPost(+postId);
            console.log("댓글 조회 성공, 총 개수:", result.length);
            return result;
        } catch (error) {
            console.error("댓글 조회 실패:", error.message);
            throw error;
        }
    }

    // 댓글 수정 (인증 필요)
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateComment(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto, @Request() req) {
        console.log("=== 댓글 수정 요청 시작 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("댓글 ID:", id);
        console.log("사용자 이메일:", req.user?.email);
        console.log("수정 데이터:", updateCommentDto);

        try {
            const result = await this.commentService.updateComment(+id, updateCommentDto, req.user.email);
            console.log("댓글 수정 성공:", result.id);
            console.log("=== 댓글 수정 완료 ===");
            return result;
        } catch (error) {
            console.error("댓글 수정 실패:", error.message);
            console.error("=== 댓글 수정 오류 ===");
            throw error;
        }
    }

    // 댓글 삭제 (인증 필요)
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteComment(@Param('id') id: string, @Request() req) {
        console.log("=== 댓글 삭제 요청 시작 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("댓글 ID:", id);
        console.log("사용자 이메일:", req.user?.email);

        try {
            await this.commentService.deleteComment(+id, req.user.email);
            console.log("댓글 삭제 성공:", id);
            console.log("=== 댓글 삭제 완료 ===");
            return { message: '댓글이 성공적으로 삭제되었습니다.' };
        } catch (error) {
            console.error("댓글 삭제 실패:", error.message);
            console.error("=== 댓글 삭제 오류 ===");
            throw error;
        }
    }

    // 개별 댓글 조회 (공개)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        console.log("=== 개별 댓글 조회 요청 ===");
        console.log("요청 시간:", new Date().toISOString());
        console.log("댓글 ID:", id);

        try {
            const result = await this.commentService.findOne(+id);
            console.log("댓글 조회 성공");
            return result;
        } catch (error) {
            console.error("댓글 조회 실패:", error.message);
            throw error;
        }
    }
} 