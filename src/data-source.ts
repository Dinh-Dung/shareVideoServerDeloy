import "reflect-metadata";
import { DataSource } from "typeorm";

import { Category } from "./entity/Category";
import { Comment } from "./entity/Comment";
import { Follow } from "./entity/Follow";
import { Like } from "./entity/Like";
import { Report } from "./entity/Report";
import { Users } from "./entity/User";
import { Video } from "./entity/Video";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "share_video_sxs1",
  synchronize: true,
  logging: false,
  entities: [Category, Comment, Follow, Like, Report, Users, Video],
  migrations: [],
  subscribers: [],
});
