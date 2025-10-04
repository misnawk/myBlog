import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "./Category.entity";
import { Post } from "../post/post.entity";
import { CreateCategoryDto, DeleteCategoryDto, UpdateCategoryDto } from "./Category.dto";
@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
        @InjectRepository(Post) private readonly postRepository: Repository<Post>
    ) {}

    // 모든 카테고리 조회 (게시글 개수 포함)
    async findAll() {
        const categories = await this.categoryRepository.find();

        console.log('모든 카테고리:', categories);
        // 모든 게시글의 카테고리 확인 (디버깅용)
        const allPosts = await this.postRepository.find();
        console.log('모든 게시글의 카테고리:', allPosts.map(p => p.category));

        // 각 카테고리별 게시글 개수 조회
        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                console.log('검색 중인 카테고리 이름:', category.name);
                const postCount = await this.postRepository.count({
                    where: { category: category.name }
                });
                console.log(`${category.name}의 게시글 수:`, postCount);
                return {
                    ...category,
                    postCount
                };
            })
        );

        return categoriesWithCount;
    }
    // 카테고리 생성
    create(createCategoryDto: CreateCategoryDto) {
        return this.categoryRepository.save(createCategoryDto);
    }
    // 카테고리 수정
    update(updateCategoryDto: UpdateCategoryDto) {
        return this.categoryRepository.save(updateCategoryDto);
    }
    // 카테고리 삭제
    delete(deleteCategoryDto: DeleteCategoryDto) {
        return this.categoryRepository.delete(deleteCategoryDto);
    }

}
