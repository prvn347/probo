import { stockServices } from "../services/stock";
import { marketType, MarketType } from "../types/stock";

export class stockControllers {
  stockService = new stockServices();
  async createMarket(merketData: MarketType) {
    try {
      return await this.stockService.createMarket(merketData);
    } catch (error) {
      console.error(error);
    }
  }
  async getMarkets(clientType:marketType){


    try {

      return await this.stockService.getMarkets(clientType)
      return
    } catch (error) {
      console.error(error);
      
    }
  }
}
