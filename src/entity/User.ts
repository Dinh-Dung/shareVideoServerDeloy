import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Video } from "./Video";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { Follow } from "./Follow";
import { Report } from "./Report";

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullname: string;

  @Column({ unique: true, nullable: true })
  nickname: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  tick: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Video, (video) => video.user)
  video: Video[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comment: Comment[];

  @OneToMany(() => Like, (comment) => comment.user)
  like: Like[];

  @OneToMany(() => Follow, (follow) => follow.me)
  follower: Follow[];

  @OneToMany(() => Follow, (follow) => follow.tiktoker)
  following: Follow[];

  @OneToMany(() => Report, (follow) => follow.user)
  report: Follow[];
}
