import { Controller, Get, Post, Put, Delete, Body } from "@nestjs/common";
import { CategoryService } from "./Category.Service";
import { CreateCategoryDto, DeleteCategoryDto, UpdateCategoryDto } from "./Category.dto";
    

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    // 모든 카테고리 조회
    @Get('admin')
    findAll() {
        return this.categoryService.findAll();
    }

    // 카테고리 생성
    @Post('create')
    create(@Body() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    // 카테고리 수정
    @Put('update')
    update(@Body() updateCategoryDto: UpdateCategoryDto) {
        return this.categoryService.update(updateCategoryDto);
    }

    // 카테고리 삭제
    @Delete('delete')
    delete(@Body() deleteCategoryDto: DeleteCategoryDto) {
        return this.categoryService.delete(deleteCategoryDto);
    }
}