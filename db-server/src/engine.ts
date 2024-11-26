import { orderbookControllers } from "./controller/orderbook";
import { stockControllers } from "./controller/stock";
import { userController } from "./controller/user";
import { RedisManager } from "./redisManager";
import { dbResponseType } from "./types";

export class engineManager {
  private orderbookController: orderbookControllers;
  private userController: userController;
  private stockController: stockControllers;
  private static instance: engineManager;
  constructor() {
    this.orderbookController = new orderbookControllers();
    this.userController = new userController();
    this.stockController = new stockControllers();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new engineManager();
    }

    return this.instance;
  }

  public processDb(dbResponse: dbResponseType) {
    if (!dbResponse || !dbResponse.type) {
      console.error("Invalid dbResponse or missing type.");
      return;
    }

    console.log("Type:", dbResponse.type);
    switch (dbResponse.type) {
      case "SELL_ORDER":
        this.orderbookController.createSellOrder(dbResponse.data);
        break;
      case "CREATE_USER":
        const result1 =   this.userController.createUser(dbResponse.data);
        
        break;
      case "GET_EVENTS":
        this.stockController.getMarkets(dbResponse.data)
        break;

      case "FIND_USER":
        this.userController.findUser(dbResponse.data)
        break;
      case "CREATE_MARKET":
        this.stockController.createMarket(dbResponse.data);
        break;
      case "BUY_ORDER":
        this.orderbookController.createBuyOrder(dbResponse.data);
        break;
      case "GET_TRANSACTIONS":
        const result = this.userController.getTransactions(dbResponse.data);
        RedisManager.getInstance().sendToApi(dbResponse.data.clientId, result);
        break;
    }
  }
}
