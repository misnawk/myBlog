import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdatePostDto {
    // 제목
    @IsOptional()
    @IsString()
    @MaxLength(10)
    title?: string;

    // 내용
    @IsOptional()
    @IsString()
    content?: string;

    // 카테고리
    @IsOptional()
    @IsString()
    @MaxLength(10)
    category?: string;

    // 이미지
    @IsOptional()
    @IsString()
    image?: string;
} 