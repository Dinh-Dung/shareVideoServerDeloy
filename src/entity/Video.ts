import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Comment } from "./Comment";
import { Users } from "./User";
import { Category } from "./Category";
import { Like } from "./Like";

export enum VideoStatus {
  Pending = "pending",
  Private = "private",
  Public = "public",
}

@Entity()
export class Video {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  url: string;

  @Column({ default: 0 })
  view: number;

  @Column({ enum: VideoStatus, default: VideoStatus.Pending, type: "enum" })
  status: VideoStatus;

  @Column({ enum: VideoStatus, type: "enum" })
  user_request_status: VideoStatus;

  @UpdateDateColumn()
  update_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Users, (user) => user.video)
  user: Users;

  @OneToMany(() => Comment, (comment) => comment.video)
  comment: Comment[];

  @OneToMany(() => Like, (like) => like.video)
  likes: Like[];

  @ManyToMany(() => Category, (category) => category.video)
  @JoinTable()
  category: Category[];
}
