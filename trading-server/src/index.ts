import express, { response } from "express";
import { Express, Request, Response } from "express";
import { userBalanceType } from "./types/userBalanceType";
import { Order, OrderBook } from "./types/orderBookType";
import { OrderRequestBody, stockBalance } from "./types/stockBalanceType";
import { redisManager } from "./redisManager";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { ErrorReply } from "redis";
import { generateToken } from "./utils/jwtUtil";
import { AuthRequest, user } from "./middleware/user";

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your React app's URL
    credentials: true, // If cookies are involved
  })
);
let INR_BALANCES: userBalanceType = {
  user1: { balance: 10, locked: 0 },
  user2: { balance: 200000, locked: 0 },
  user5: { balance: 500000, locked: 0 },
};
let ORDERBOOK: OrderBook = {};
let STOCK_BALANCES: stockBalance = {};

app.get("/ping", (req, res) => {
  res.send("PONG");
});
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

app.post("/user/signup", async (req: Request, res: Response) => {
  try {
    const { username, name, password } = req.body;


    const clientId = uuidv4();

    const response = await redisManager
      .getInstance()
      .sendToDb_processor(clientId, {
        type: "CREATE_USER",
        data: {
          clientId,
          username,
          name,
          password,
        },
      });

    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    res.json(error);
  }
});
app.post("/user/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const clientId = uuidv4();
    const response = await redisManager.getInstance().sendToDb_processor(clientId, {
      type: "FIND_USER",
      data: {
        clientId,
        username,
        password,
      },
    });
    if(!response){
      throw new Error("invalid request")
    }

    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error });
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

app.post("/event/create", async (req, res) => {
  try {
    const clientId = uuidv4();
    const { symbol, endtime, description, source_of_truth, starttime } =
      req.body;

    const data = {
      type: "CREATE_SYMBOL",
      data: {
        clientId: clientId,
        stockSymbol: symbol,
      },
    };
    redisManager.getInstance().sendToDb_processor(clientId, {
      type: "CREATE_MARKET",
      data: {
        clientId,
        symbol,
        starttime,
        endtime,
        description,
        source_of_truth,
      
      },
    });
  

    res.status(201).json({
      response: "created",
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while creating new stock symbol",
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
    const clientId = uuidv4();
    const data = {
      type: "SELL_ORDER",
      data: {
        clientId: clientId,
        userId,
        quantity,
        stockSymbol,
        price,
        stockType,
      },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);

    // await client.lPush("orders", orderbookData);

    res.status(200).json({
      response: response.responseData,
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

    const clientId = uuidv4();
    const data = {
      type: "BUY_ORDER",
      data: {
        clientId: clientId,
        userId,
        stockSymbol,
        quantity,
        price,
        stockType,
      },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);

    res.status(200).json(response.responseData);
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : `Error occurred in /order/buy`,
    });
  }
});

app.get("/transactions", async (req: Request, res: Response) => {
  const userId = req.body.userId;
  const clientId = uuidv4();
  const response = await redisManager
    .getInstance()
    .sendToDb_processor(clientId, {
      type: "GET_TRANSACTIONS",
      data: {
        clientId: clientId,
        username: userId,
      },
    });

  console.log(response);

  res.json(response.responseData);
});
app.get("/events",async (req,res) =>{

  try {
    const clientId = uuidv4();
  const response = await redisManager
    .getInstance()
    .sendToDb_processor(clientId, {
      type: "GET_EVENTS",
      data: {
        clientId: clientId,
      },
    });

  console.log(response);

  res.json(response);
    
  } catch (error) {
    res.status(400).json({
      error
    })
    
  }


})
app.post("/order/cancel", () => {});

app.get("/balance/inr", async (req, res) => {
  try {
    const clientId = uuidv4();
    const data = {
      type: "GET_INRBALANCE",
      data: {
        clientId: clientId,
      },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);
    res.json({
      response: response.responseData,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while getting inr balance",
    });
  }
});

app.get("/orderbook", async (req, res) => {
  try {
    const clientId = uuidv4();
    const data = {
      type: "GET_ORDERBOOK",
      data: {
        clientId: clientId,
      },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);
    res.json({
      response: response.responseData,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while getting orderbook",
    });
  }
});

app.get("/orderbook/:stockSymbol", async (req, res) => {
  try {
    const clientId = uuidv4();
    const stockSymbol = req.params.stockSymbol;
    const data = {
      type: "GET_STOCKS_ORDERBOOK",
      data: {
        clientId: clientId,
        stockSymbol: stockSymbol,
      },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);
    res.json({
      response: response.responseData,
    });
  } catch (error) {
    res.status(500).json({
      msg: "error while getting orderbook",
    });
  }
});

app.get("/balance/inr/rs",user, async (req:AuthRequest , res) => {
  try {
    const userId = req.user;
    console.log(userId)
    
    const clientId = uuidv4();
    const data = {
      type: "CHECK_BALANCE",
      data: {
        clientId: clientId,
        userId: userId,
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
      msg: "error while getting inr",
    });
  }
});

app.get("/balance/stock/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const clientId = uuidv4();
    const data = {
      type: "CHECK_STOCK",
      data: {
        clientId: clientId,
        userId: userId,
      },
    };
    const response = await redisManager
      .getInstance()
      .sendAndAwait(data, clientId);

    res.status(200).json({
      response: response.responseData,
    });
  } catch (error) {
    res.json({ error });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port" + 3000);
});

export default app;
