import { IsNotEmpty, IsString, IsOptional, MaxLength } from "class-validator";

export class CreatePostDto {
    // 제목
    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    title: string;

    // 작성자
    @IsNotEmpty()
    @IsString()
    author: string;

    // 내용
    @IsNotEmpty()
    @IsString()
    content: string;

    // 카테고리
    @IsNotEmpty()
    @IsString()
    @MaxLength(10)
    category: string;

    // 이미지
    @IsOptional()
    @IsString()
    image?: string;
} 