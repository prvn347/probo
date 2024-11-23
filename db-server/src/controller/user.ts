import { userServices } from "../services/user";
import { userResponse, userSignin } from "../types/user";

export class userController {
  userService = new userServices();
  async createUser(userDetail: userResponse) {
    try {
      return await this.userService.createUser(userDetail);
    } catch (error) {
      console.error(error);
      throw new Error("error while creating user");
    }
  }
  async findUser(userDetail: userSignin) {
    try {
      return await this.userService.findUser(userDetail);
    } catch (error) {
      console.error(error);
      throw new Error("error while finding user");
    }
  }
  async getTransactions(userMeta: { clientId: string; username: string }) {
    try {
      return await this.userService.getTransactions(userMeta);
    } catch (error) {
      throw new Error("error while getting transactions");
    }
  }
}
