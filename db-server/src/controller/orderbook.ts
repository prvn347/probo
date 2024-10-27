import { orderbookServices } from "../services/orderbook";
import { sellOrderType, tradeType } from "../types/orderbook";

export class orderbookControllers {
  orderbookService = new orderbookServices();

  async createSellOrder(sellOrder: sellOrderType) {
    console.log("inside order book service");
    console.log(sellOrder + " insite controller ");
    try {
      return await this.orderbookService.createSellOrder(sellOrder);
    } catch (error) {
      console.error(error);
    }
  }
  async createBuyOrder(sellOrder: sellOrderType) {
    try {
      return await this.orderbookService.createBuyOrder(sellOrder);
    } catch (error) {
      console.error(error);
    }
  }

  async createTrade(tradeData: tradeType) {
    try {
      return await this.orderbookService.createTrade(tradeData);
    } catch (error) {
      console.error(error);
    }
  }
}
