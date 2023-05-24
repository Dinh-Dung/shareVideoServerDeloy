import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Users } from "./User";
import { Video } from "./Video";

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  create_at: Date;

  @ManyToOne(() => Video, (video) => video.like, { cascade: true })
  video: Video;

  @ManyToOne(() => Users, (user) => user.like)
  user: Users;
}
