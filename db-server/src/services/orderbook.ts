import { PrismaClient } from "@prisma/client";
import { sellOrderType, tradeType } from "../types/orderbook";
const prisma = new PrismaClient();

export class orderbookServices {
  async createSellOrder(sellOrder: sellOrderType) {
    try {
      console.log("inseide service");
      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;
      const result = await prisma.order.create({
        data: {
          id: sellOrder.id,
          userId: sellOrder.userId,
          marketId: sellOrder.marketId,
          side: sellOrder.side,
          type: sellOrder.type,
          quantity: sellOrder.quantity,
          price: sellOrder.price,
          filled_quantity: 0,
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
      const orderId = `order_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;
      const result = await prisma.order.create({
        data: {
          id: buyOrder.id,
          userId: buyOrder.userId,
          marketId: buyOrder.marketId,
          side: buyOrder.side,
          type: buyOrder.type,
          quantity: buyOrder.quantity,
          price: buyOrder.price,
          filled_quantity: 0,
        },
      });
      return result;
    } catch (error) {
      console.error("Error creating buy order:", error);
      throw new Error("Error while creating buy order");
    }
  }
  async createTrade(tradeDetails: tradeType) {
    try {
      const tradeId = `trade_${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}`;

      const trade = await prisma.trade.create({
        data: {
          id: tradeId,
          buyOrderId: tradeDetails.buyOrderId,
          sellOrderId: tradeDetails.sellOrderId,
          price: tradeDetails.price,
        },
      });

      await prisma.$transaction([
        prisma.order.update({
          where: { id: tradeDetails.buyOrderId },
          data: {
            filled_quantity: {
              increment: tradeDetails.quantity,
            },
          },
        }),
        prisma.order.update({
          where: { id: tradeDetails.sellOrderId },
          data: {
            filled_quantity: {
              increment: tradeDetails.quantity,
            },
          },
        }),
      ]);

      return trade;
    } catch (error) {
      console.error("Error creating trade:", error);
      throw new Error("Error while creating trade");
    }
  }

  async getOrderById(orderId: string) {
    try {
      return await prisma.order.findUnique({
        where: { id: orderId },
      });
    } catch (error) {
      console.error("Error fetching order:", error);
      throw new Error("Error while fetching order");
    }
  }

  async getTradesByOrder(orderId: string) {
    try {
      return await prisma.trade.findMany({
        where: {
          OR: [{ buyOrderId: orderId }, { sellOrderId: orderId }],
        },
      });
    } catch (error) {
      console.error("Error fetching trades:", error);
      throw new Error("Error while fetching trades");
    }
  }
}
