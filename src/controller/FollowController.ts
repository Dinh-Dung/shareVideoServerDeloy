import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Follow } from "../entity/Follow";
import { Users } from "../entity/User";
import { Video } from "../entity/Video";

export class FollowController {
  constructor(
    private followRepository = AppDataSource.getRepository(Follow),
    private userRepository = AppDataSource.getRepository(Users),
    private videoRepository = AppDataSource.getRepository(Video)
  ) {
    this.followUser = this.followUser.bind(this);
    this.getFollowUser = this.getFollowUser.bind(this);
    this.unfollowUser = this.unfollowUser.bind(this);
    this.getFollowerOfUser = this.getFollowerOfUser.bind(this);
  }
  async followUser(request: Request, response: Response, next: NextFunction) {
    const { me, tiktoker } = request.body;
    try {
      const meData = await this.userRepository.findOneBy({ id: me });
      const tiktokerData = await this.userRepository.findOneBy({
        id: tiktoker,
      });

      if (!me || !tiktoker) {
        throw new Error(`User with id not found`);
      }
      const follow = new Follow();
      follow.me = meData;
      follow.tiktoker = tiktokerData;

      await this.followRepository.save(follow);
      return response.status(200).send("Follow user successfully");
    } catch (error) {
      console.log(error);
      return response.status(404).json({
        data: null,
        error: "You can't follow user",
      });
    }
  }
  async getFollowUser(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const userId = request.params.userId;
      const queryBuilder = this.followRepository
        .createQueryBuilder("follow")
        .leftJoinAndSelect("follow.user", "user")
        .where("user.id = :id", { id: userId });
      const followers = await queryBuilder.getMany();
      return response.status(200).json({
        data: followers,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "You can't get follow user",
      });
    }
  }
  async unfollowUser(request: Request, response: Response, next: NextFunction) {
    const { me, tiktoker } = request.body;
    try {
      const follow = await this.followRepository.findOne({
        where: { me: { id: me }, tiktoker: { id: tiktoker } },
        order: { id: "DESC" },
      });

      await this.followRepository.remove(follow);

      return response.status(200).send("Unfollow user successfully");
    } catch (error) {
      console.log(error);
      return response.status(400).json({
        data: null,
        error: "You can't unlike follow user",
      });
    }
  }
  async getFollowerOfUser(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const userId = Number(request.params.userId);
    try {
      const follows = await this.followRepository.find({
        where: { tiktoker: { id: userId } },
        relations: ["me"],
      });
      const followers = follows.map((follow) => follow.me);
      return response.status(200).json({
        data: followers,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "You can't get follow user",
      });
    }
  }
}
