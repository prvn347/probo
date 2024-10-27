import { PrismaClient } from "@prisma/client";
import { MarketType } from "../types/stock";
const prisma = new PrismaClient();

export class stockServices {
  async createMarket(market: MarketType) {
    try {
      const result = await prisma.market.create({
        data: {
          id: market.symbol,
          symbol: market.symbol,
          sourceOfTruth: market.source_of_truth,
          endTime: market.endtime,
          categoryId: market.categoryId,
          description: market.description,
        },
      });
      return result;
    } catch (error) {
      console.error(error);
      throw new Error(" error while creating market ");
    }
  }
}
