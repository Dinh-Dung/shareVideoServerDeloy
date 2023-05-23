import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { Users } from "./User";

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Users, (user) => user.follower)
  me: Users;

  @ManyToOne(() => Users, (user) => user.following)
  tiktoker: Users;
}
