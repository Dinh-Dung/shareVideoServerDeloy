import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Like } from "../entity/Like";
import { Video } from "../entity/Video";
import { Users } from "../entity/User";

export class LikeController {
  constructor(
    private likeRepository = AppDataSource.getRepository(Like),
    private userRepository = AppDataSource.getRepository(Users),
    private videoRepository = AppDataSource.getRepository(Video)
  ) {
    this.likeVideo = this.likeVideo.bind(this);
    this.likeCountOfVideo = this.likeCountOfVideo.bind(this);
    this.unlikeVideo = this.unlikeVideo.bind(this);
  }

  async likeVideo(request: Request, response: Response, next: NextFunction) {
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
        response.status(404).send("Video or User not found");
        return;
      }
      const like = await this.likeRepository
        .createQueryBuilder("like")
        .where("like.user = :userId", { userId })
        .andWhere("like.video = :videoId", { videoId })
        .getOne();
      if (like) {
        // If the user has already liked the video, return a success message
        return response.status(200).send("Video liked successfully");
      }

      const newLike = this.likeRepository.create({
        user: user,
        video: video,
      });

      await this.likeRepository.save(newLike);
      response.status(200).send("Video liked successfully");
    } catch (error) {
      return response.status(404).json({
        data: null,
        error: "You can't like video",
      });
    }
  }
  async likeCountOfVideo(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const videoId = request.params.videoId; // replace with the ID of the video you want to retrieve the count of likes for

      const likeCount = await this.likeRepository
        .createQueryBuilder("like")
        .leftJoinAndSelect("like.video", "video")
        .where("video.id = :id", { id: videoId })
        .getCount();

      return response.status(200).json({
        data: likeCount,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "get like count failed",
      });
    }
  }
  async unlikeVideo(request: Request, response: Response, next: NextFunction) {
    const { userId, videoId } = request.body;
    try {
      const newestLikeByUser = await this.likeRepository.findOneBy({
        user: { id: userId },
        video: { id: videoId },
      });

      await this.likeRepository.remove(newestLikeByUser);

      return response.status(200).send("Unlike video successfully");
    } catch (error) {
      console.log(error);
      return response.status(400).json({
        data: null,
        error: "Unlike video failed",
      });
    }
  }
}
