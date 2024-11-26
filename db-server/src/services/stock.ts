import { PrismaClient } from "@prisma/client";
import { marketType, MarketType } from "../types/stock";
import { RedisManager } from "../redisManager";
const prisma = new PrismaClient();

export class stockServices {
  async createMarket(market: MarketType) {
    try {
      console.log(market)
      const result = await prisma.market.create({
        data: {
   
          symbol: market.symbol,
          sourceOfTruth: market.source_of_truth,
          endTime: market.endtime,
          startTime:market.starttime,
          description: market.description,
        },
      });
      console.log(result)
      return result;
    } catch (error) {
      console.error(error);
      throw new Error(" error while creating market ");
    }
  }
  async getMarkets(market:marketType){
    try {
      const markets = await prisma.market.findMany()
      RedisManager.getInstance().sendToApi(market.clientId,markets)
      return markets
    } catch (error) {
      console.error(error);
      throw new Error(" error while creating market ");
      
    }
  }
}
