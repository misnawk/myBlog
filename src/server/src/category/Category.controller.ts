import { Controller, Get } from "@nestjs/common";
import { CategoryService } from "./Category.Service";
    

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get('admin')
    findAll() {
        return this.categoryService.findAll();
    }
}