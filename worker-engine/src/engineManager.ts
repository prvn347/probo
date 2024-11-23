import { response } from "express";
import { redisManager } from "./redisManager";
import { DBmessage, responseType } from "./types";
import { Order, OrderBook, PriceLevel } from "./types/orderBookType";
import { stockBalance } from "./types/stockBalanceType";
import { userBalanceType } from "./types/userBalanceType";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export class engineManager {
  
  private INR_BALANCES: userBalanceType = {};
  private ORDERBOOK: OrderBook = {};
  private STOCK_BALANCES: stockBalance = {};
  private static instance: engineManager;
  static getInstance() {
    if (!this.instance) {
      this.instance = new engineManager();
    }

    return this.instance;
  }
  constructor() {
    let snapshot = null;
    console.log("WITH_SNAPSHOT value:", process.env.WITH_SNAPSHOT);
    console.log("inside construtor ");
    try {
      if (process.env.WITH_SNAPSHOT) {
        console.log("inside constructor");
        const fileContent = fs
          .readFileSync("./src/snapshot.json", "utf-8")
          .trim();
        console.log(fileContent);
        if (fileContent) {
          snapshot = JSON.parse(fileContent); // Only parse if file is not empty
        } else {
          console.log(
            "snapshot.json is empty, initializing with default values."
          );
        }
      }
    } catch (e) {
      console.log("Error reading or parsing snapshot:", e);
    }

    if (snapshot) {
      // Initialize ORDERBOOK, STOCK_BALANCES, and INR_BALANCES with parsed data
      this.ORDERBOOK = this.initializeOrderBook(snapshot.ORDERBOOK);
      this.STOCK_BALANCES = this.initializeStockBalances(
        snapshot.STOCK_BALANCES
      );
      this.INR_BALANCES = this.initializeInrBalances(snapshot.INR_BALANCES);
    }

    setInterval(() => {
      this.saveSnapshot();
    }, 3000);
  }
  private initializeOrderBook(orderBookSnapshot: any): OrderBook {
    const orderBook: OrderBook = {};
    for (const symbol in orderBookSnapshot) {
      const symbolData = orderBookSnapshot[symbol];
      orderBook[symbol] = {
        yes: {},
        no: {},
      };

      for (const type of ["yes", "no"] as const) {
        for (const price in symbolData[type]) {
          const priceLevel = symbolData[type][price];
          orderBook[symbol][type][price] = {
            total: priceLevel.total,
            orders: priceLevel.orders.map((order: any) => ({
              quantity: order.quantity,
              userId: order.userId,
              type: order.type,
            })),
          };
        }
      }
    }
    return orderBook;
  }

  private initializeStockBalances(stockBalancesSnapshot: any): stockBalance {
    const stockBalances: stockBalance = {};
    for (const userId in stockBalancesSnapshot) {
      const userStocks = stockBalancesSnapshot[userId];
      stockBalances[userId] = {};

      for (const stockSymbol in userStocks) {
        const stockPosition = userStocks[stockSymbol];
        stockBalances[userId][stockSymbol] = {
          yes: {
            quantity: stockPosition.yes.quantity,
            locked: stockPosition.yes.locked,
          },
          no: {
            quantity: stockPosition.no.quantity,
            locked: stockPosition.no.locked,
          },
        };
      }
    }
    return stockBalances;
  }

  private initializeInrBalances(inrBalancesSnapshot: any): userBalanceType {
    const inrBalances: userBalanceType = {};
    for (const userId in inrBalancesSnapshot) {
      const userBalance = inrBalancesSnapshot[userId];
      inrBalances[userId] = {
        balance: userBalance.balance,
        locked: userBalance.locked,
      };
    }
    return inrBalances;
  }

  saveSnapshot() {
    const snapshotData = {
      ORDERBOOK: this.ORDERBOOK,
      STOCK_BALANCES: this.STOCK_BALANCES,
      INR_BALANCES: this.INR_BALANCES,
    };

    fs.writeFileSync(
      "./src/snapshot.json",
      JSON.stringify(snapshotData, null, 2)
    );
    console.log(snapshotData);
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
      case "SELL_ORDER":
        this.sellOrdes(response.data);
        break;
      case "BUY_ORDER":
        const buyorderresult = this.buyOrder(response.data);
        redisManager.getInstance().sendToApi(response.data.clientId, {
          clientId: response.data.clientId,
          responseData: buyorderresult,
        });
        redisManager.getInstance().publishMessage("order", {
          eventId: response.data.stockSymbol,
          data: this.ORDERBOOK[response.data.stockSymbol],
        });
        break;
      case "CHECK_BALANCE":
        this.checkBalance(response.data);
        break;
      case "GET_ORDERBOOK":
        this.getOrderbook(response.data);
        break;
      case "GET_INRBALANCE":
        this.getInrBalance(response.data);
        break;
      case "CHECK_STOCK":
        this.checkStockBalance(response.data);
        break;
      case "GET_STOCKS_ORDERBOOK":
        this.getStockOrder(response.data);
        break;
    }
  }

  public getStockOrder(userdata: { clientId: string; stockSymbol: string }) {
    try {
      if (!this.ORDERBOOK[userdata.stockSymbol]) {
        redisManager.getInstance().sendToApi(userdata.clientId, {
          clientId: userdata.clientId,
          responseData: "stock doesn't exist",
        });
      }
      const stockOrderbook = this.ORDERBOOK[userdata.stockSymbol];
      redisManager.getInstance().sendToApi(userdata.clientId, {
        clientId: userdata.clientId,
        responseData: stockOrderbook,
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while creating user");
    }
  }
  public createUser(userData: { clientId: string; userId: string }) {
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
  public getOrderbook(userData: { clientId: string }) {
    try {
      const orderbook = this.ORDERBOOK;
      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: {
          orderbook,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while getting orderbook");
    }
  }

  public checkBalance(userData: { clientId: string; userId: string }) {
    try {
      if (!this.INR_BALANCES[userData.userId]) {
        console.log(userData.userId);
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: {
            message: "user doesn't exist",
          },
        });
        return;
      }
      const balance = this.INR_BALANCES[userData.userId];
      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: balance,
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while getting user balance");
    }
  }
  public getInrBalance(userData: { clientId: string }) {
    try {
      const inrbalance = this.INR_BALANCES;
      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: {
          inrbalance,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while getting inrbalance");
    }
  }
  public checkStockBalance(userData: { clientId: string; userId: string }) {
    try {
      if (!this.STOCK_BALANCES[userData.userId]) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: {
            message: "user doesn't exist",
          },
        });
        return;
      }
      const stockBalance = this.STOCK_BALANCES[userData.userId];

      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: {
          stockBalance,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while getting inrbalance");
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
      const yesOrderValues: Record<string, PriceLevel> = {};
      for (let i = 50; i <= 950; i += 50) {
        yesOrderValues[i] = { total: 0, orders: [] };
      }

      const noOrderValues: Record<string, PriceLevel> = {};
      for (let i = 50; i <= 950; i += 50) {
        noOrderValues[i] = { total: 0, orders: [] };
      }

      if (!this.ORDERBOOK[userData.stockSymbol]) {
        this.ORDERBOOK[userData.stockSymbol] = {
          yes: yesOrderValues,
          no: noOrderValues,
        };
      }

      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: {
          message: `Symbol ${userData.stockSymbol} created`,
          orderbook: this.ORDERBOOK[userData.stockSymbol],
        },
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
        return;
      }

      if (!this.INR_BALANCES[userData.userId]) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "USER DOESN'T Exist",
        });
        return;
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
        return;
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

      return redisManager.getInstance().sendToApi(userData.clientId, {
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

  public sellOrdes(userData: {
    clientId: string;
    userId: string;
    quantity: number;
    stockSymbol: string;
    price: number;
    stockType: string;
  }) {
    try {
      if (
        !userData.userId ||
        !userData.stockSymbol ||
        !userData.quantity ||
        !userData.price ||
        !userData.stockType
      ) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "MISSING Required paramas",
        });
        return;
      }

      if (
        userData.price < 50 ||
        userData.price > 950 ||
        userData.price % 50 !== 0
      ) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: `price is not valid, should be between 0.5 and 9.5 and in 0.5 increments`,
        });
        return;
      }
      console.log("sell details" + JSON.stringify(userData));

      const userPosition =
        this.STOCK_BALANCES[userData.userId][userData.stockSymbol];
      if (!userPosition) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "user don't have this stock",
        });
        return;
      }
      //  @ts-ignore
      const stockQuantity = userPosition[userData.stockType];

      if (stockQuantity.quantity < userData.quantity) {
        redisManager.getInstance().sendToApi(userData.clientId, {
          clientId: userData.clientId,
          responseData: "user don't have this amount of  stock to selll",
        });
        return;
      }

      stockQuantity.quantity -= userData.quantity;
      stockQuantity.locked += userData.quantity;
      //  @ts-ignore
      this.ORDERBOOK[userData.stockSymbol][userData.stockType][
        userData.price
      ].total += userData.quantity;
      //  @ts-ignore
      this.ORDERBOOK[userData.stockSymbol][userData.stockType][
        userData.price
      ].orders.push({
        quantity: userData.quantity,
        userId: userData.userId,
        type: "sell",
      });
      const sellOrderId = this.generateOrderId();
      const message = {
        type: "SELL_ORDER",
        data: {
          id: sellOrderId,
          userId: userData.userId,
          marketId: userData.stockSymbol,
          side: userData.stockType,
          type: "sell",
          quantity: userData.quantity,
          price: userData.price,
          filled_quantity: 0,
        },
      };

      this.pushToDb(message);

      redisManager.getInstance().sendToApi(userData.clientId, {
        clientId: userData.clientId,
        responseData: {
          messsage: `Sell order placed for ${userData.quantity} '${userData.stockSymbol}' options at price ${userData.price}.`,
          orderbook: this.ORDERBOOK[userData.stockSymbol],
          userBalance: this.INR_BALANCES[userData.userId],
          STOCK_BALANCES:
            this.STOCK_BALANCES[userData.userId][userData.stockSymbol],
        },
      });
      redisManager.getInstance().publishMessage("order", {
        eventId: userData.stockSymbol,
        data: this.ORDERBOOK[userData.stockSymbol],
      });
    } catch (error) {
      console.error(error);
      throw new Error("error while minting tokens");
    }
  }
  public pushToDb(message: any) {
    redisManager.getInstance().pushMessage(message);
    return;
  }
  private initializeStockBalance(userId: string, stockSymbol: string) {
    if (!this.STOCK_BALANCES[userId]) {
      this.STOCK_BALANCES[userId] = {};
    }
    if (!this.STOCK_BALANCES[userId][stockSymbol]) {
      this.STOCK_BALANCES[userId][stockSymbol] = {
        yes: { quantity: 0, locked: 0 },
        no: { quantity: 0, locked: 0 },
      };
    }
  }

  public buyOrder(userData: {
    clientId: string;
    userId: string;
    stockSymbol: string;
    quantity: number;
    price: number;
    stockType: string;
  }) {
    try {
      if (
        !userData.userId ||
        !userData.stockSymbol ||
        !userData.quantity ||
        !userData.price ||
        !userData.stockType
      ) {
        return { message: `Missing required params` };
      }

      if (
        userData.price < 50 ||
        userData.price > 950 ||
        userData.price % 50 !== 0
      ) {
        return {
          message: `Price is not valid, should be between 0.5 and 9.5 and in 0.5 increments`,
        };
      }

      if (!this.ORDERBOOK[userData.stockSymbol]) {
        return {
          message: `The stockSymbol is missing in orderbook. Please create one`,
        };
      }
      const totalCost = userData.price * userData.quantity;
      const userBalance = this.INR_BALANCES[userData.userId]?.balance;

      if (userBalance === undefined) {
        return { error: `No such userId exists yet. Please create one` };
      }

      if (userBalance < totalCost) {
        return { error: `User balance insufficient` };
      }

      let remainingQuantity = userData.quantity;
      const buyOrderId = this.generateOrderId();

      let totalSpent = 0;
      const oppositeSide = userData.stockType === "yes" ? "no" : "yes";
      const oppositePrice = 1000 - userData.price;

      // Deduct total cost from user's balance and lock it
      this.INR_BALANCES[userData.userId].balance -= totalCost;
      this.INR_BALANCES[userData.userId].locked += totalCost;

      // Check for matching sell orders
      for (let i = 50; i <= userData.price && remainingQuantity > 0; i += 50) {
        //  @ts-ignore
        const priceLevel =
          //  @ts-ignore
          this.ORDERBOOK[userData.stockSymbol][userData.stockType][i];
        if (priceLevel.total > 0) {
          const executedQuantity = Math.min(
            remainingQuantity,
            priceLevel.total
          );
          remainingQuantity -= executedQuantity;
          const executionCost = executedQuantity * i;
          totalSpent += executionCost;

          // Update orderbook
          priceLevel.total -= executedQuantity;

          const indexesToDelete: number[] = [];

          for (let index = 0; index < priceLevel.orders.length; index++) {
            const sellOrder = priceLevel.orders[index];
            const numSellOrderQuantity = sellOrder.quantity;
            const sellerUserId = sellOrder.userId;
            const orderType = sellOrder.type;

            this.initializeStockBalance(sellerUserId, userData.stockSymbol);

            if (numSellOrderQuantity <= executedQuantity) {
              indexesToDelete.push(index);

              // Update seller's balance and stock
              if (this.INR_BALANCES[sellerUserId]) {
                if (orderType === "sell") {
                  this.INR_BALANCES[sellerUserId].balance +=
                    numSellOrderQuantity * i;
                  //  @ts-ignore
                  this.STOCK_BALANCES[sellerUserId][userData.stockSymbol][
                    userData.stockType
                  ].locked -= numSellOrderQuantity;
                } else {
                  // If it was originally a buy order, unlock the funds and update stock
                  const originalBuyPrice = 1000 - i;
                  this.INR_BALANCES[sellerUserId].locked -=
                    numSellOrderQuantity * originalBuyPrice;
                  this.STOCK_BALANCES[sellerUserId][userData.stockSymbol][
                    oppositeSide
                  ].quantity += numSellOrderQuantity;
                }
              }
            } else {
              const remainingSellOrderQuantity =
                numSellOrderQuantity - executedQuantity;
              priceLevel.orders[index].quantity = remainingSellOrderQuantity;

              // Update seller's balance and stock
              if (this.INR_BALANCES[sellerUserId]) {
                if (orderType === "sell") {
                  this.INR_BALANCES[sellerUserId].balance +=
                    executedQuantity * i;
                  //  @ts-ignore
                  this.STOCK_BALANCES[sellerUserId][userData.stockSymbol][
                    userData.stockType
                  ].locked -= executedQuantity;
                } else {
                  // If it was originally a buy order, unlock the funds and update stock
                  const originalBuyPrice = 1000 - i;
                  this.INR_BALANCES[sellerUserId].locked -=
                    executedQuantity * originalBuyPrice;
                  this.STOCK_BALANCES[sellerUserId][userData.stockSymbol][
                    oppositeSide
                  ].quantity += executedQuantity;
                }
              }
              break;
            }
          }

          for (let i = indexesToDelete.length - 1; i >= 0; i--) {
            priceLevel.orders.splice(indexesToDelete[i], 1);
          }

          // Update buyer's stock balance
          if (!this.STOCK_BALANCES[userData.userId])
            this.STOCK_BALANCES[userData.userId] = {};
          if (!this.STOCK_BALANCES[userData.userId][userData.stockSymbol])
            this.STOCK_BALANCES[userData.userId][userData.stockSymbol] = {
              yes: { quantity: 0, locked: 0 },
              no: { quantity: 0, locked: 0 },
            };
          //  @ts-ignore
          this.STOCK_BALANCES[userData.userId][userData.stockSymbol][
            userData.stockType
          ].quantity += executedQuantity;

          // Unlock the spent amount
          this.INR_BALANCES[userData.userId].locked -= executionCost;
        }
      }

      // If there's remaining quantity, create a new order
      if (remainingQuantity > 0) {
        const priceString = oppositePrice;

        this.ORDERBOOK[userData.stockSymbol][oppositeSide][priceString].total +=
          remainingQuantity;
        this.ORDERBOOK[userData.stockSymbol][oppositeSide][
          priceString
        ].orders.push({
          quantity: remainingQuantity,
          userId: userData.userId,
          type: "buy",
        });
        const buyOrderMessage: DBmessage = {
          type: "BUY_ORDER",
          data: {
            id: buyOrderId,
            userId: userData.userId,
            marketId: userData.stockSymbol,
            side: userData.stockType,
            type: "sell",
            quantity: userData.quantity,
            price: userData.price,
            executed_quantity: userData.quantity - remainingQuantity,
          },
        };
        this.pushToDb(buyOrderMessage);
      } else {
        const buyOrderMessage: DBmessage = {
          type: "BUY_ORDER",
          data: {
            id: buyOrderId,
            userId: userData.userId,
            marketId: userData.stockSymbol,
            side: userData.stockType,
            type: "buy",
            quantity: userData.quantity,
            price: userData.price,
            executed_quantity: userData.quantity - remainingQuantity,
          },
        };
        this.pushToDb(buyOrderMessage);
      }

      return {
        message: `Buy order processed. ${
          userData.quantity - remainingQuantity
        } ${
          userData.stockType
        } tokens bought at market price. ${remainingQuantity} ${oppositeSide} tokens listed for sale.`,
      };
    } catch (error) {
      console.error(error);
      throw new Error("error while minting tokens");
    }
  }
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
