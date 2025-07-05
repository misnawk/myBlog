import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdatePostDto {
    // 제목
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    // 내용
    @IsOptional()
    @IsString()
    content?: string;

    // 카테고리
    @IsOptional()
    @IsString()
    category?: string;

    // 이미지
    @IsOptional()
    @IsString()
    image?: string;
} 