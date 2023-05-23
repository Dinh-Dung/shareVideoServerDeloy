import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Video, VideoStatus } from "../entity/Video";
import { Users } from "../entity/User";
import { Not } from "typeorm";

export class AdminController {
  constructor(
    private videoRepository = AppDataSource.getRepository(Video),
    private userRepository = AppDataSource.getRepository(Users)
  ) {
    this.getVideoPending = this.getVideoPending.bind(this);
    this.acceptVideoUploaded = this.acceptVideoUploaded.bind(this);
    this.getAllUser = this.getAllUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  async getVideoPending(
    request: Request & { file: any },
    response: Response,
    next: NextFunction
  ) {
    try {
      const list = await this.videoRepository.find({
        relations: ["user"],
        where: {
          status: VideoStatus.Pending,
        },
      });
      for (const video of list) {
        if (video.user_request_status === VideoStatus.Private) {
          video.status = VideoStatus.Private;
          await this.videoRepository.save(video);
        }
      }
      list.filter((video) => video.user_request_status !== VideoStatus.Private);
      const shuffledList = list.sort(() => Math.random() - 0.5);
      return response.status(200).json({
        data: shuffledList,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "get videos failed",
      });
    }
  }

  async acceptVideoUploaded(
    request: Request & { file: any },
    response: Response,
    next: NextFunction
  ) {
    try {
      const { videoId, accept } = request.body;

      const video = await this.videoRepository.findOneBy({ id: videoId });

      if (!accept) {
        //delete video
        await this.videoRepository.remove(video);
        return response.status(200).json({
          data: "Video deleted !",
          error: null,
        });
      }

      video.status = video.user_request_status;
      await this.videoRepository.save(video);

      return response.status(200).json({
        data: "Video accepted !",
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "no value",
      });
    }
  }
  async getAllUser(
    request: Request & { file: any },
    response: Response,
    next: NextFunction
  ) {
    try {
      const users = await this.userRepository.find({
        where: {
          username: Not("admin"), // Loại bỏ tài khoản admin
        },
        relations: ["video", "like", "follower", "following"],
      });
      const usersInformation = users.map((user) => {
        return {
          user,
          likeCount: user.like.length,
          videoCount: user.video.length,
          followerCount: user.follower.length,
          followingCount: user.following.length,
        };
      });
      return response.status(200).json({
        data: usersInformation,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "Get user false",
      });
    }
  }
  async deleteUser(request: Request, response: Response, next: NextFunction) {
    const { userId } = request.body;
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        await this.userRepository.remove(user);
        console.log("Delete user successfully");
      } else {
        console.log("User not found");
      }
      return response.status(200).send("Delete User successfully!");
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "Delete false",
      });
    }
  }
}
