import { PrismaClient } from "@prisma/client";
import { userResponse, userSignin } from "../types/user";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { RedisManager } from "../redisManager";
import { generateToken } from "../utils/jwtUtils";
const prisma = new PrismaClient();

export class userServices {
  async createUser(userDetails: userResponse) {
    try {
      console.log("usedetalis" + userDetails);
      const hashedPassword = await bcrypt.hashSync(userDetails.password, 10);
      const result = await prisma.user.create({
        data: {
          username: userDetails.username,
          name: userDetails.name,
          password: hashedPassword,
        },
      });

      const userId = result.id;

      const token = generateToken(userId);
      console.log("user created ", result);
      RedisManager.getInstance().sendToApi(userDetails.clientId, {
        result,
        token,
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new Error(" Error while creating user");
    }
  }
  async findUser(userDetails: userSignin) {
    try {
      console.log("user detail for signin is " + userDetails)
      const user = await prisma.user.findFirst({
        where: {
          username: userDetails.username,
        },
      });

      if (user) {
        const isValidPassword = await bcrypt.compare(
          userDetails.password,
          user?.password || ""
        );
        if (!isValidPassword) {
          throw new Error("wrong password");
        }
        const userId = user.id;
        if (isValidPassword) {
          const token = generateToken(userId);
          RedisManager.getInstance().sendToApi(userDetails.clientId, {
            user,
            token,
          });
          return { user, token };
        }
      } else {
        throw new Error("user not found");
      }
    } catch (error) {
      console.error(error);
      throw new Error(" Error while creating user");
    }
  }
  async getTransactions(userMeta: { clientId: string; username: string }) {
    try {
      console.log("usermeta i s" + userMeta);
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: userMeta.username,
        },
      });
      console.log("transactions" + transactions);
      return transactions;
    } catch (error) {
      console.error(error);
      throw new Error(" Error while getting user's transactions");
    }
  }
}
