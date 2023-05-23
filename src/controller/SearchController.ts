import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Users } from "../entity/User";

export class SearchController {
  constructor(private userRepository = AppDataSource.getRepository(Users)) {
    this.searchUser = this.searchUser.bind(this);
  }
  async searchUser(request: Request, response: Response, next: NextFunction) {
    const { query } = request.query;
    try {
      const users = await this.userRepository
        .createQueryBuilder("user")
        .where("user.fullname LIKE :query", { query: `%${query}%` })
        .orWhere("user.nickname LIKE :query", { query: `%${query}%` })
        .orWhere("user.email LIKE :query", { query: `%${query}%` })
        .getMany();
      return response.status(200).json({
        data: users,
        error: null,
      });
    } catch (error) {
      return response.status(400).json({
        data: null,
        error: "Can't find users",
      });
    }
  }
}
