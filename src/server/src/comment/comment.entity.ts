import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    content: string;

    // 댓글 작성자 - User와 Many-to-One 관계
    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ 
        name: 'authorId', 
        referencedColumnName: 'email' 
    })
    author: User;

    // 댓글이 속한 게시글 - Post와 Many-to-One 관계 (지연 로딩)
    @ManyToOne('Post', { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId' })
    post: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}