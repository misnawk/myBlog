import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('categories')
export class Category {
    // 시퀀스
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    name: string;
        
    @Column()
    description: string;

}   