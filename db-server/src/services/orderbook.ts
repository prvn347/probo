import { PrismaClient } from "@prisma/client";
import { sellOrderType, tradeType } from "../types/orderbook";
const prisma = new PrismaClient();

export class orderbookServices {
  async createSellOrder(sellOrder: sellOrderType) {
    try {
      console.log("inseide service");

      const result = await prisma.transaction.create({
        data: {
          id: sellOrder.id,
          userId: sellOrder.userId,
          marketId: sellOrder.marketId,
          side: sellOrder.side,
          type: sellOrder.type,
          quantity: sellOrder.quantity,
          price: sellOrder.price,
          executed_qantity: sellOrder.executed_quantity,
        },
      });
      console.log(result);
      return result;
    } catch (error) {
      console.error(error);
      throw new Error("error while creating sell order");
    }
  }
  async createBuyOrder(buyOrder: sellOrderType) {
    try {
      const result = await prisma.transaction.create({
        data: {
          id: buyOrder.id,
          userId: buyOrder.userId,
          marketId: buyOrder.marketId,
          side: buyOrder.side,
          type: buyOrder.type,
          quantity: buyOrder.quantity,
          price: buyOrder.price,
          executed_qantity: buyOrder.executed_quantity,
        },
      });
      return result;
    } catch (error) {
      console.error("Error creating buy order:", error);
      throw new Error("Error while creating buy order");
    }
  }

  async getOrderById(orderId: string) {
    try {
      return await prisma.transaction.findUnique({
        where: { id: orderId },
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new Error("Error while fetching order");
    }
  }
}
