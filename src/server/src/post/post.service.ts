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
    async createPost(postData: CreatePostDto, authorId: number): Promise<Post>{
        try{    
        const post = this.postRepository.create({
            ...postData,
            author: {id: authorId} as any,
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


}