import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
    @IsNotEmpty({ message: '댓글 내용을 입력해주세요.' })
    @IsString({ message: '댓글 내용은 문자열이어야 합니다.' })
    @MaxLength(1000, { message: '댓글은 1000자를 초과할 수 없습니다.' })
    content: string;

    @IsNotEmpty({ message: '게시글 ID가 필요합니다.' })
    postId: number;
} 