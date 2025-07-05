import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Post } from "./post.entity";
import { CreatePostDto } from "./create-post.dto";

@Injectable()
export class PostService{
    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
    ){}


    // 게시글 생성
    async createPost(postData: CreatePostDto, authorEmail: string): Promise<Post>{
        try{    
        const post = this.postRepository.create({
            ...postData,
            author: {email: authorEmail} as any,
        });
        return this.postRepository.save(post);
    } catch (error){
        console.error('게시글 생성 실패:', error);
        throw error;
       }
    }

    // 모든 게시글 조회
    async findAll(): Promise<Post[]>{
        try{
            return this.postRepository.find({
                relations:['author'],
                order: {
                    createdAt: 'DESC',
                },
            });
        } catch (error){
            console.error('게시글 조회 실패:', error);
            throw error;
        }
    }

    // 개별 게시글 조회
    async findOne(id: number): Promise<Post>{
        try{
            const post = await this.postRepository.findOne({
                where: { id },
                relations: ['author'],
            });
            
            if (!post) {
                throw new Error('게시글을 찾을 수 없습니다.');
            }
            
            return post;
        } catch (error){
            console.error('게시글 조회 실패:', error);
            throw error;
        }
    }


}