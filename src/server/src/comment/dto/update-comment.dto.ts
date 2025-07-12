import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
    @IsOptional()
    @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
    @MaxLength(1000, { message: '댓글은 1000자를 초과할 수 없습니다.' })
    content?: string;
} 