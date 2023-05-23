import { Entity, PrimaryGeneratedColumn, CreateDateColumn , Column, OneToMany, ManyToOne, ManyToMany } from "typeorm"
import {Video} from './Video'

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number  

    @Column()
    name:string

    @CreateDateColumn()
    create_at: Date

    @ManyToMany(()=>Video, video=>video.category)
    video: Video[]
}