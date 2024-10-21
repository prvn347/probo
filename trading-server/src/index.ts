import express from "express";
import { Express, Request, Response } from "express";
import { userBalanceType } from "./types/userBalanceType";
import { Order, OrderBook } from "./types/orderBookType";
import { OrderRequestBody, stockBalance } from "./types/stockBalanceType";
import { redisManager } from "./redisManager";
import { v4 as uuidv4 } from "uuid";

const app: Express = express();
app.use(express.json());

let INR_BALANCES: userBalanceType = {
  user1: { balance: 10, locked: 0 },
  user2: { balance: 200000, locked: 0 },
  user5: { balance: 500000, locked: 0 },
};
let ORDERBOOK: OrderBook = {};
let STOCK_BALANCES: stockBalance = {};

app.post("/reset", async (req, res) => {
  try {
    const clientId = uuidv4();
    const data = {
      type: "RESET",
      data: { clientId: clientId },
    };
    const { responseData } = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);

    res.status(200).json({
      message: responseData,
    });
  } catch (error) {
    res.json({ error: error });
  }
});
app.post("/user/create/:userId", async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const clientId = uuidv4();
    const data = {
      type: "CREATE_USER",
      data: { clientId: clientId, userId: userId },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);
    console.log(response);
    res.status(201).json({
      response: response.responseData,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while creating new user",
    });
  }
});

app.post("/onramp/inr", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const clientId = uuidv4();
    const data = {
      type: "ONRAMP_MONEY",
      data: {
        clientId: clientId,
        userId: userId,
        amount: amount,
      },
    };

    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);

    res.status(200).json({
      response: response.responseData,
    });
  } catch (error) {
    res.status(500).json({
      error: error,
    });
  }
});

app.post("/symbol/create/:stockSymbol", async (req, res) => {
  try {
    const stockSymbol = req.params.stockSymbol;
    const clientId = uuidv4();
    const data = {
      type: "CREATE_SYMBOL",
      data: {
        clientId: clientId,
        stockSymbol: stockSymbol,
      },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);

    res.status(201).json({
      response: response.responseData,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while creating new stock symbol",
    });
  }
});

app.post("/trade/mint", async (req, res) => {
  try {
    const { userId, stockSymbol, quantity, price } = req.body;
    const clientId = uuidv4();
    const data = {
      type: "MINT",
      data: {
        clientId: clientId,
        userId: userId,
        stockSymbol,
        quantity,
        price,
      },
    };

    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);

    res.status(200).json({
      response: response.responseData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "error while minting token",
    });
  }
});

app.post("/order/sell", async (req: Request, res: Response) => {
  try {
    const { userId, stockSymbol, quantity, price, stockType } =
      req.body as OrderRequestBody;

    if (!userId || !stockSymbol || !quantity || !price || !stockType) {
      res.status(400).json({ message: `Missing required params` });
    }

    if (price < 50 || price > 950 || price % 50 !== 0) {
      res.status(400).json({
        message: `Price is not valid, should be between 0.5 and 9.5 and in 0.5 increments`,
      });
    }

    const userPosition = STOCK_BALANCES[userId]?.[stockSymbol];
    if (!userPosition) {
      res.status(400).json({ message: `user doesnt have this token` });
    }

    const stockQuantity = userPosition[stockType];

    if (stockQuantity.quantity < quantity) {
      res
        .status(400)
        .json({ message: `user doesnt have enough tokens to sell` });
    }

    stockQuantity.quantity -= quantity;
    stockQuantity.locked += quantity;

    ORDERBOOK[stockSymbol][stockType][price].total += quantity;
    ORDERBOOK[stockSymbol][stockType][price].orders[quantity] = {
      [userId]: "sell",
    };
    const orderbookData = JSON.stringify({
      eventId: stockSymbol,
      ORDERBOOK,
    });
    // await client.lPush("orders", orderbookData);

    res.status(200).json({
      messsage: `Sell order placed for ${quantity} '${stockSymbol}' options at price ${price}.`,
      orderbook: ORDERBOOK[stockSymbol],
      userBalance: INR_BALANCES[userId],
      STOCK_BALANCES: STOCK_BALANCES[userId][stockSymbol],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "error while selling stock",
    });
  }
});
app.post("/order/buy", async (req, res) => {
  try {
    const { userId, stockSymbol, quantity, price, stockType } =
      req.body as OrderRequestBody;

    if (!userId || !stockSymbol || !quantity || !price || !stockType) {
      res.status(400).json({ message: `Missing required params` });
    }

    if (price < 50 || price > 950 || price % 50 !== 0) {
      res.status(400).json({
        message: `Price is not valid, should be between 0.5 and 9.5 and in 0.5 increments`,
      });
    }

    if (!ORDERBOOK[stockSymbol]) {
      res.status(400).json({
        message: `The stockSymbol is missing in orderbook. Please create one`,
      });
    }
    const totalCost = price * quantity;
    const userBalance = INR_BALANCES[userId]?.balance;

    if (userBalance === undefined) {
      res
        .status(400)
        .json({ error: `No such userId exists yet. Please create one` });
    }

    if (userBalance < totalCost) {
      res.status(400).json({ error: `User balance insufficient` });
    }

    let remainingQuantity = quantity;
    let totalSpent = 0;
    const oppositeSide = stockType === "yes" ? "no" : "yes";
    const oppositePrice = 1000 - price;

    // Deduct total cost from user's balance and lock it
    INR_BALANCES[userId].balance -= totalCost;
    INR_BALANCES[userId].locked += totalCost;

    // Check for matching sell orders
    for (let i = 50; i <= price && remainingQuantity > 0; i += 50) {
      const priceLevel = ORDERBOOK[stockSymbol][stockType][i];
      if (priceLevel && priceLevel.total > 0) {
        const executedQuantity = Math.min(remainingQuantity, priceLevel.total);
        remainingQuantity -= executedQuantity;
        const executionCost = executedQuantity * i;
        totalSpent += executionCost;

        // Update orderbook
        priceLevel.total -= executedQuantity;

        Object.entries(priceLevel.orders).forEach(
          ([orderQuantity, orderDetails]) => {
            const numOrderQuantity = Number(orderQuantity);
            if (numOrderQuantity <= executedQuantity) {
              const sellerUserId = Object.keys(orderDetails)[0];
              const orderType = orderDetails[sellerUserId];
              delete priceLevel.orders[orderQuantity];

              // Update seller's balance and stock
              console.log(
                numOrderQuantity +
                  " and " +
                  i +
                  " selled id is " +
                  sellerUserId +
                  " and " +
                  orderType
              );
              if (INR_BALANCES[sellerUserId]) {
                if (orderType === "sell") {
                  INR_BALANCES[sellerUserId].balance += numOrderQuantity * i;
                  // @ts-ignore
                  STOCK_BALANCES[sellerUserId][stockSymbol][stockType].locked -=
                    numOrderQuantity;
                } else {
                  // If it was originally a buy order, unlock the funds and update stock
                  const originalBuyPrice = 10 - i;
                  INR_BALANCES[sellerUserId].locked -=
                    numOrderQuantity * originalBuyPrice;
                  INR_BALANCES[sellerUserId].balance += numOrderQuantity * i;
                  STOCK_BALANCES[sellerUserId][stockSymbol][
                    oppositeSide
                  ].quantity += numOrderQuantity;
                }
              }
            } else {
              const remainingOrderQuantity =
                numOrderQuantity - executedQuantity;
              priceLevel.orders[remainingOrderQuantity.toString()] =
                orderDetails;
              delete priceLevel.orders[orderQuantity];
            }
          }
        );

        // Update buyer's stock balance
        if (!STOCK_BALANCES[userId]) STOCK_BALANCES[userId] = {};
        if (!STOCK_BALANCES[userId][stockSymbol])
          STOCK_BALANCES[userId][stockSymbol] = {
            yes: { quantity: 0, locked: 0 },
            no: { quantity: 0, locked: 0 },
          };
        // @ts-ignore
        STOCK_BALANCES[userId][stockSymbol][stockType].quantity +=
          executedQuantity;

        // Unlock the spent amount
        INR_BALANCES[userId].locked -= executionCost;
      }
    }

    // If there's remaining quantity, create a new order
    if (remainingQuantity > 0) {
      const priceString = oppositePrice;
      if (!ORDERBOOK[stockSymbol][oppositeSide][priceString]) {
        ORDERBOOK[stockSymbol][oppositeSide][priceString] = {
          total: 0,
          orders: {},
        };
      }
      ORDERBOOK[stockSymbol][oppositeSide][priceString].total +=
        remainingQuantity;
      ORDERBOOK[stockSymbol][oppositeSide][priceString].orders[
        remainingQuantity
      ] = { [userId]: "buy" };

      // The funds for the remaining quantity are already locked, so no need to lock again
    }
    const orderbookData = JSON.stringify({
      eventId: stockSymbol,
      ORDERBOOK,
    });
    // await client.lPush("orders", orderbookData);

    res.status(200).json({
      message: `Buy order processed. ${
        quantity - remainingQuantity
      } ${stockType} tokens bought at market price. ${remainingQuantity} ${oppositeSide} tokens listed for sale.`,
    });
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : `Error occurred in /order/buy`,
    });
  }
});

app.post("/order/cancel", () => {});

app.get("/balance/inr", (req, res) => {
  try {
    res.json({
      INR_BALANCES,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while getting inr balance",
    });
  }
});

app.get("/orderbook", (req, res) => {
  try {
    res.status(200).json({
      ORDERBOOK,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while getting orderbook",
    });
  }
});

app.get("/balance/inr/:userId", (req, res) => {
  try {
    const userId = req.params.userId;
    if (!INR_BALANCES[userId]) {
      res.status(400).json({ message: `No such userId exists` });
    }
    const balance = INR_BALANCES[userId];
    res.status(201).json({
      balance: balance,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while getting inr",
    });
  }
});

app.get("/balance/stock/:userId", (req, res) => {
  try {
    const userId = req.params.userId;
    if (!STOCK_BALANCES[userId]) {
      res
        .status(404)
        .json({ message: `No stock balances found for user ${userId}` });
    }
    const balance = STOCK_BALANCES[userId];
    res.status(200).json({
      balance,
    });
  } catch (error) {
    res.json({ error });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port" + 3000);
});

export default app;
