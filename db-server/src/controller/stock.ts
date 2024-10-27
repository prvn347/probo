import { stockServices } from "../services/stock";
import { MarketType } from "../types/stock";

export class stockControllers {
  stockService = new stockServices();
  async createMarket(merketData: MarketType) {
    try {
      return await this.stockService.createMarket(merketData);
    } catch (error) {
      console.error(error);
    }
  }
}
