import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity('posts')
export class Post {
    // 시퀀스
    @PrimaryGeneratedColumn()
    id: number;

    // 제목
    @Column({length:10,nullable:false})
    title: string;  

    // 내용
    @Column('text')
    content: string;

    // 카테고리
    @Column({length:10})
    category: string;

    @Column({ nullable: true })
    image: string;

    // 여러개의 게시물은 하나의 유저에 속할 수 있음
    @ManyToOne(() => User,{nullable: false,onDelete:'CASCADE',})
    @JoinColumn({ name: 'authorId' })
    author: User;

    // 생성일
    @CreateDateColumn()
    createdAt: Date;

    // 수정일
    @UpdateDateColumn()
    updatedAt: Date;
} 