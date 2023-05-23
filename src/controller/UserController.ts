import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Users } from "../entity/User";
import { genSalt, hash, compare } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Follow } from "../entity/Follow";
import { Equal } from "typeorm";
import { Like } from "../entity/Like";
import { VideoStatus } from "../entity/Video";

export class UserController {
  constructor(
    private userRepository = AppDataSource.getRepository(Users),
    private followRepository = AppDataSource.getRepository(Follow),
    private likeRepository = AppDataSource.getRepository(Like)
  ) {
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.getAllUser = this.getAllUser.bind(this);
    this.getUserFollowers = this.getUserFollowers.bind(this);
    this.randomUsersSuggest = this.randomUsersSuggest.bind(this);
    this.getProfileAndVideoByNickname =
      this.getProfileAndVideoByNickname.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async login(request: Request, response: Response, next: NextFunction) {
    try {
      const { username, password } = request.body;

      const user = await this.userRepository.findOneBy({ username }); // Select * from User where username = username

      // Comparing password
      const isValid = await compare(password, user.password);
      if (!isValid) {
        return {
          data: null,
          error: "Username or password is not valid !",
          status: 401,
        };
      }

      const accessToken = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      const refreshToken = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      return response.status(200).json({
        data: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        error: null,
      });
    } catch (error) {
      return response.status(401).json({
        data: null,
        error: "Username or password is not valid !",
        status: 401,
      });
    }
  }

  async refreshToken(request: Request, response: Response) {
    try {
      const refreshToken = request.query["token"];

      const isValid = await jwt.verify(refreshToken, process.env.JWT_SECRET);

      const accessToken = jwt.sign(
        { userId: isValid.id, username: isValid.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return response.status(200).json({
        data: {
          access_token: accessToken,
        },
        error: null,
      });
    } catch (error) {
      return response.status(401).json({
        data: null,
        error: "Token is not valid !",
        status: 401,
      });
    }
  }

  async register(request: Request, response: Response, next: NextFunction) {
    try {
      const { fullname, username, password, email, address } = request.body;

      // Hasing password
      const saltRounds = 10;
      const salt = await genSalt(saltRounds);
      const hashedPassword = await hash(password, salt);
      // Random nickname
      const randomNuber: number = Math.floor(Math.random() * 1000);
      const nicknameRandom: string = `user${randomNuber}`;

      const user = Object.assign(new Users(), {
        fullname,
        username,
        nickname: nicknameRandom,
        email,
        address,
        password: hashedPassword,
      });

      const newUser = await this.userRepository.save(user);
      return response.status(201).json({
        data: newUser,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "Create failed",
      });
    }
  }

  async getProfile(request: Request, response: Response, next: NextFunction) {
    try {
      const userId = request["userId"];

      const user = await this.userRepository.findOneBy({ id: userId });

      return response.status(200).json({
        data: user,
        error: null,
      });
    } catch (error) {
      return response.sendStatus(403);
    }
  }
  async getAllUser(request: Request, response: Response, next: NextFunction) {
    try {
      const user = await this.userRepository.find();
      return response.status(200).json({
        data: user,
        error: null,
      });
    } catch (error) {
      return response.sendStatus(403);
    }
  }
  async getUserFollowers(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const userId = request.params.userId;
    try {
      const followers = await this.followRepository.find({
        where: {
          me: Equal(userId),
        },
        relations: ["tiktoker"], // eager load the tiktoker relationship to avoid N+1 queries
      });
      return response.status(200).json({
        data: followers,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "get follower failed",
      });
    }
  }
  async randomUsersSuggest(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    try {
      const randomUsers = await this.userRepository
        .createQueryBuilder("user")
        .leftJoin("user.video", "video")
        .select(["user", "COUNT(video.id) as video_count"])
        .where("user.username <> 'Admin'")
        .groupBy("user.id")
        .orderBy("video_count", "DESC")
        .limit(5)
        .getRawMany();
      return response.status(200).json({
        data: randomUsers,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "Failed to get random users",
      });
    }
  }
  async getProfileAndVideoByNickname(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    const nickname = request.params.nickname;
    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.video", "video")
        .where("user.nickname = :nickname", { nickname });
      // .andWhere("video.status = :status", { status: "public" });

      const userWithVideos = await queryBuilder.getOne();

      if (userWithVideos) {
        return response.status(200).json({
          data: userWithVideos,
          error: null,
        });
      } else {
        return response.status(404).json({
          data: null,
          error: "User not found",
        });
      }
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "Faild to get random users",
      });
    }
  }
}
