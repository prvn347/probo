import { response } from "express";
import { redisManager } from "./redisManager";
import { responseType } from "./types";
import { Order, OrderBook } from "./types/orderBookType";
import { stockBalance } from "./types/stockBalanceType";
import { userBalanceType } from "./types/userBalanceType";

export class engineManager {
  private INR_BALANCES: userBalanceType = {};
  private ORDERBOOK: OrderBook = {};
  private STOCK_BALANCES: stockBalance = {};
  private static instance: engineManager;

  constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new engineManager();
    }

    return this.instance;
  }
  public processResponse(response: responseType) {
    switch (response.type) {
      case "CREATE_USER":
        this.createUser(response.data);
        break;
      case "RESET":
        this.resetData(response.data);
        break;
      case "ONRAMP_MONEY":
        const message = this.onrampMoney(response.data);
        redisManager.getInstance().sendToApi(response.data.clientId, {
          clientId: response.data.clientId,
          responseData: message,
        });
        break;
      case "CREATE_SYMBOL":
        this.createSymbol(response.data);
        break;
      case "MINT":
        this.mintTokens(response.data);
        break;
    }
  }
  public createUser(userData: { clientId: string; userId: string }) {
    console.log(userData);

    try {
      if (this.INR_BALANCES[userData.userId]) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "user already exist",
        });
        return "user already exist";
      }
      const initialBalance = {
        balance: 0,
        locked: 0,
      };
      this.INR_BALANCES[userData.userId] = initialBalance;
      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: {
          msg: `User ${userData.userId} created`,
          userBalance: this.INR_BALANCES[userData.userId],
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while creating user");
    }
  }
  public resetData(userData: { clientId: string }) {
    try {
      Object.keys(this.INR_BALANCES).forEach((key) => {
        delete this.INR_BALANCES[key];
      });
      Object.keys(this.ORDERBOOK).forEach((key) => {
        delete this.ORDERBOOK[key];
      });
      Object.keys(this.STOCK_BALANCES).forEach((key) => {
        delete this.STOCK_BALANCES[key];
      });
      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: "RESET DONE",
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while resetting data");
    }
  }
  public onrampMoney(userData: {
    clientId: string;
    userId: string;
    amount: number;
  }) {
    try {
      if (
        typeof userData.userId !== "string" ||
        typeof userData.amount !== "number" ||
        userData.amount <= 0
      ) {
        return "Invalid Input. UserId must be a string and amount must be a positive number";
      }
      if (!this.INR_BALANCES[userData.userId]) {
        return "user doesn't exist";
      }

      this.INR_BALANCES[userData.userId].balance += userData.amount;
      return {
        message: `Onramped ${userData.userId} with amount ${userData.amount}.`,
        balance: this.INR_BALANCES[userData.userId],
      };
    } catch (error) {
      console.error(error);
      throw new Error("error while onramping money");
    }
  }
  public createSymbol(userData: { clientId: string; stockSymbol: string }) {
    try {
      const orderValues: Record<string, Order> = {};
      for (let i = 50; i <= 950; i += 50) {
        orderValues[i] = { total: 0, orders: {} };
      }
      if (!this.ORDERBOOK[userData.stockSymbol]) {
        this.ORDERBOOK[userData.stockSymbol] = {
          yes: { ...orderValues },
          no: { ...orderValues },
        };
      }
      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: `Symbol ${userData.stockSymbol} created`,
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while creating symbol");
    }
  }
  public mintTokens(userData: {
    clientId: string;
    userId: string;
    stockSymbol: string;
    quantity: number;
    price: number;
  }) {
    try {
      if (
        !userData.userId ||
        !userData.stockSymbol ||
        typeof userData.quantity !== "number" ||
        typeof userData.price !== "number"
      ) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "INVALID_DATA",
        });
      }

      if (!this.INR_BALANCES[userData.userId]) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "USER DOESN'T Exist",
        });
      }

      const userBalance = this.INR_BALANCES[userData.userId].balance;

      if (
        userBalance < userData.price * userData.quantity ||
        userData.price * userData.quantity < 1000
      ) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "NOT ENOUGH BALANCE",
        });
      }
      if (!this.STOCK_BALANCES[userData.userId]) {
        this.STOCK_BALANCES[userData.userId] = {};
      }

      if (!this.STOCK_BALANCES[userData.userId][userData.stockSymbol]) {
        this.STOCK_BALANCES[userData.userId][userData.stockSymbol] = {
          yes: { quantity: 0, locked: 0 },
          no: { quantity: 0, locked: 0 },
        };
      }
      this.INR_BALANCES[userData.userId].balance -=
        userData.price * userData.quantity;
      this.STOCK_BALANCES[userData.userId][userData.stockSymbol].no.quantity +=
        userData.quantity | 0;
      this.STOCK_BALANCES[userData.userId][userData.stockSymbol].yes.quantity +=
        userData.quantity | 0;

      const remaining = this.INR_BALANCES[userData.userId].balance;

      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: {
          message: `Minted ${userData.quantity} 'yes' and 'no' tokens for user ${userData.userId}, remaining balance is ${remaining} `,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while minting tokens");
    }
  }
}
