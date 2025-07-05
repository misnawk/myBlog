import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './create-post.dto';
import { UpdatePostDto } from './update-post.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
    ){}


    // 게시글 생성
    async createPost(createPostDto: CreatePostDto, userEmail: string): Promise<Post>{
        console.log("=== 포스트 서비스: 게시글 생성 시작 ===");
        console.log("생성 데이터:", {
            title: createPostDto.title,
            category: createPostDto.category,
            contentLength: createPostDto.content?.length || 0,
            userEmail: userEmail
        });

        try{    
            const post = this.postRepository.create({
                ...createPostDto,
                author: { email: userEmail } as any,
            });

            console.log("엔티티 생성 완료");
            
            const savedPost = await this.postRepository.save(post);
            console.log("데이터베이스 저장 성공:", savedPost.id);
            console.log("=== 포스트 서비스: 게시글 생성 완료 ===");
            
            return savedPost;
        } catch (error){
            console.error("=== 포스트 서비스: 게시글 생성 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            console.error("오류 스택:", error.stack);
            throw error;
        }
    }

    // 모든 게시글 조회
    async findAll(): Promise<Post[]>{
        console.log("=== 포스트 서비스: 모든 게시글 조회 시작 ===");
        
        try{
            const posts = await this.postRepository.find({
                relations:['author'],
                order: {
                    createdAt: 'DESC',
                },
            });
            
            console.log("조회된 게시글 수:", posts.length);
            console.log("=== 포스트 서비스: 모든 게시글 조회 완료 ===");
            
            return posts;
        } catch (error){
            console.error("=== 포스트 서비스: 게시글 조회 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }

    // 개별 게시글 조회
    async findOne(id: number): Promise<Post>{
        console.log("=== 포스트 서비스: 개별 게시글 조회 시작 ===");
        console.log("조회할 게시글 ID:", id);
        
        try{
            const post = await this.postRepository.findOne({
                where: { id },
                relations: ['author'],
            });
            
            if (!post) {
                console.log("게시글을 찾을 수 없음:", id);
                throw new NotFoundException(`게시글 ID ${id}를 찾을 수 없습니다.`);
            }
            
            console.log("게시글 조회 성공:", post.title);
            console.log("=== 포스트 서비스: 개별 게시글 조회 완료 ===");
            
            return post;
        } catch (error){
            console.error("=== 포스트 서비스: 개별 게시글 조회 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }

    async updatePost(id: number, updatePostDto: UpdatePostDto, userEmail: string): Promise<Post> {
        console.log("=== 포스트 서비스: 게시글 수정 시작 ===");
        console.log("수정할 게시글 ID:", id);
        console.log("수정 데이터:", updatePostDto);
        console.log("요청 사용자:", userEmail);

        try {
            // 게시글 존재 확인 및 작성자 검증
            const post = await this.postRepository.findOne({
                where: { id },
                relations: ['author'],
            });

            if (!post) {
                console.log("게시글을 찾을 수 없음:", id);
                throw new NotFoundException(`게시글 ID ${id}를 찾을 수 없습니다.`);
            }

            // 작성자 확인
            if (post.author.email !== userEmail) {
                console.log("권한 없음:", userEmail, "vs", post.author.email);
                throw new ForbiddenException('게시글 수정 권한이 없습니다.');
            }

            // 게시글 업데이트
            Object.assign(post, updatePostDto);
            const updatedPost = await this.postRepository.save(post);
            
            console.log("게시글 수정 성공:", updatedPost.id);
            console.log("=== 포스트 서비스: 게시글 수정 완료 ===");
            
            return updatedPost;
        } catch (error) {
            console.error("=== 포스트 서비스: 게시글 수정 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }

    async deletePost(id: number, userEmail: string): Promise<void> {
        console.log("=== 포스트 서비스: 게시글 삭제 시작 ===");
        console.log("삭제할 게시글 ID:", id);
        console.log("요청 사용자:", userEmail);

        try {
            // 게시글 존재 확인 및 작성자 검증
            const post = await this.postRepository.findOne({
                where: { id },
                relations: ['author'],
            });

            if (!post) {
                console.log("게시글을 찾을 수 없음:", id);
                throw new NotFoundException(`게시글 ID ${id}를 찾을 수 없습니다.`);
            }

            // 작성자 확인
            if (post.author.email !== userEmail) {
                console.log("권한 없음:", userEmail, "vs", post.author.email);
                throw new ForbiddenException('게시글 삭제 권한이 없습니다.');
            }

            // 게시글 삭제
            await this.postRepository.remove(post);
            
            console.log("게시글 삭제 성공:", id);
            console.log("=== 포스트 서비스: 게시글 삭제 완료 ===");
        } catch (error) {
            console.error("=== 포스트 서비스: 게시글 삭제 실패 ===");
            console.error("데이터베이스 오류:", error.message);
            throw error;
        }
    }
}