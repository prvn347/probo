import { PrismaClient } from "@prisma/client";
import { userResponse } from "../types/user";

import { v4 as uuidv4 } from "uuid";
const prisma = new PrismaClient();

export class userServices {
  async createUser(userDetails: userResponse) {
    try {
      const uuid = uuidv4();

      const result = await prisma.user.create({
        data: {
          id: uuid,
          username: userDetails.username,
        },
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new Error(" Error while creating user");
    }
  }
  async findUser(userDetails: userResponse) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: userDetails.username,
        },
      });

      if (user) {
        return user;
      } else {
        throw new Error("user not found");
      }
    } catch (error) {
      console.error(error);
      throw new Error(" Error while creating user");
    }
  }
}
