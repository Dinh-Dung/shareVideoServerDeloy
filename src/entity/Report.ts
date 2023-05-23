import { Entity,PrimaryGeneratedColumn ,CreateDateColumn , Column, OneToMany, ManyToOne } from "typeorm"
import { Users } from "./User"

@Entity()
export class Report{
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content_report: string

    @CreateDateColumn()
    created_at: Date

    @ManyToOne(()=>Users, user=>user.report)
    user: Users
}