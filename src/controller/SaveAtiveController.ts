import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Like } from "../entity/Like";
import { Follow } from "../entity/Follow";
import { Users } from "../entity/User";
import { Video } from "../entity/Video";

export class SaveActive {
  constructor(
    private likeRepository = AppDataSource.getRepository(Like),
    private videoRepository = AppDataSource.getRepository(Video),
    private userRepository = AppDataSource.getRepository(Users),
    private followRepository = AppDataSource.getRepository(Follow)
  ) {
    this.getActiveLike = this.getActiveLike.bind(this);
    this.getActiveFollow = this.getActiveFollow.bind(this);
  }

  async getActiveLike(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const { userId, videoId } = request.body;
    try {
      const video = await this.videoRepository
        .createQueryBuilder("video")
        .where("video.id = :id", { id: videoId })
        .getOne();
      const user = await this.userRepository
        .createQueryBuilder("user")
        .where("user.id = :id", { id: userId })
        .getOne();

      if (!video || !user) {
        return response.status(404).send("Video or User not found");
      }

      const liked = await this.likeRepository
        .createQueryBuilder("like")
        .where("like.user = :userId", { userId })
        .andWhere("like.video = :videoId", { videoId })
        .getOne();
      // console.log(liked);
      if (liked) {
        return response.status(200).json({
          data: true,
          error: null,
        });
      } else {
        return response.status(200).json({
          data: false,
          error: null,
        });
      }
    } catch (error) {
      return response.status(400).json({
        data: false,
        error: "get liked of user failed",
      });
    }
  }

  async getActiveFollow(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const { me, tiktoker } = request.body;

    try {
      const meID = await this.userRepository
        .createQueryBuilder("user")
        .where("user.id = :id", { id: me })
        .getOne();

      const tiktokerID = await this.userRepository
        .createQueryBuilder("user")
        .where("user.id = :id", { id: tiktoker })
        .getOne();

      if (!meID || !tiktokerID) {
        return response.status(404).send("User not found");
      }

      const followed = await this.followRepository
        .createQueryBuilder("follow")
        .where("follow.me = :me", { me })
        .andWhere("follow.tiktoker = :tiktoker", { tiktoker })
        .getOne();
      // console.log(followed);
      if (followed) {
        return response.status(200).json({
          data: true,
          error: null,
        });
      } else {
        return response.status(200).json({
          data: false,
          error: null,
        });
      }
    } catch (error) {
      console.log(error);

      return response.status(400).json({
        data: false,
        error: "get liked of user failed",
      });
    }
  }
}
