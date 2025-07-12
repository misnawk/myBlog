import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Post } from '../post/post.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
    ) {}

    // 댓글 생성
    async createComment(createCommentDto: CreateCommentDto, userEmail: string): Promise<Comment> {
        console.log("=== 댓글 서비스: 댓글 생성 시작 ===");
        console.log("생성 데이터:", createCommentDto);
        console.log("사용자 이메일:", userEmail);

        try {
            // 게시글 존재 확인
            const post = await this.postRepository.findOne({
                where: { id: createCommentDto.postId }
            });

            if (!post) {
                throw new NotFoundException(`게시글 ID ${createCommentDto.postId}를 찾을 수 없습니다.`);
            }

            const comment = this.commentRepository.create({
                content: createCommentDto.content,
                author: { email: userEmail } as any,
                post: { id: createCommentDto.postId } as any,
            });

            const savedComment = await this.commentRepository.save(comment);
            console.log("댓글 생성 성공:", savedComment.id);
            console.log("=== 댓글 서비스: 댓글 생성 완료 ===");

            return savedComment;
        } catch (error) {
            console.error("=== 댓글 서비스: 댓글 생성 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }

    // 특정 게시글의 모든 댓글 조회
    async getCommentsByPost(postId: number): Promise<Comment[]> {
        console.log("=== 댓글 서비스: 게시글별 댓글 조회 시작 ===");
        console.log("게시글 ID:", postId);

        try {
            const comments = await this.commentRepository.find({
                where: { post: { id: postId } },
                relations: ['author'],
                order: { createdAt: 'ASC' }
            });

            console.log("댓글 조회 성공, 총 개수:", comments.length);
            return comments;
        } catch (error) {
            console.error("=== 댓글 서비스: 댓글 조회 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }

    // 댓글 수정
    async updateComment(id: number, updateCommentDto: UpdateCommentDto, userEmail: string): Promise<Comment> {
        console.log("=== 댓글 서비스: 댓글 수정 시작 ===");
        console.log("댓글 ID:", id);
        console.log("수정 데이터:", updateCommentDto);
        console.log("사용자 이메일:", userEmail);

        try {
            const comment = await this.commentRepository.findOne({
                where: { id },
                relations: ['author']
            });

            if (!comment) {
                throw new NotFoundException(`댓글 ID ${id}를 찾을 수 없습니다.`);
            }

            // 작성자 확인
            if (comment.author.email !== userEmail) {
                throw new ForbiddenException('댓글 수정 권한이 없습니다.');
            }

            Object.assign(comment, updateCommentDto);
            const updatedComment = await this.commentRepository.save(comment);

            console.log("댓글 수정 성공:", updatedComment.id);
            console.log("=== 댓글 서비스: 댓글 수정 완료 ===");

            return updatedComment;
        } catch (error) {
            console.error("=== 댓글 서비스: 댓글 수정 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }

    // 댓글 삭제
    async deleteComment(id: number, userEmail: string): Promise<void> {
        console.log("=== 댓글 서비스: 댓글 삭제 시작 ===");
        console.log("댓글 ID:", id);
        console.log("사용자 이메일:", userEmail);

        try {
            const comment = await this.commentRepository.findOne({
                where: { id },
                relations: ['author']
            });

            if (!comment) {
                throw new NotFoundException(`댓글 ID ${id}를 찾을 수 없습니다.`);
            }

            // 작성자 확인
            if (comment.author.email !== userEmail) {
                throw new ForbiddenException('댓글 삭제 권한이 없습니다.');
            }

            await this.commentRepository.remove(comment);
            console.log("댓글 삭제 성공:", id);
            console.log("=== 댓글 서비스: 댓글 삭제 완료 ===");
        } catch (error) {
            console.error("=== 댓글 서비스: 댓글 삭제 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }

    // 개별 댓글 조회
    async findOne(id: number): Promise<Comment> {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['author', 'post']
        });

        if (!comment) {
            throw new NotFoundException(`댓글 ID ${id}를 찾을 수 없습니다.`);
        }

        return comment;
    }
} 