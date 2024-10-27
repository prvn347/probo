const axios = require("axios");
const WebSocket = require("ws");

const HTTP_SERVER_URL = "http://localhost:3000";
const WS_SERVER_URL = "ws://localhost:8080";

describe("Trading System Tests", () => {
  let ws;

  beforeAll((done) => {
    ws = new WebSocket(WS_SERVER_URL);
    ws.on("open", done);
  });

  afterAll(() => {
    ws.close();
  });

  beforeEach(async () => {
    await axios.post(`${HTTP_SERVER_URL}/reset`);
  });

  const waitForWSMessage = () => {
    return new Promise((resolve) => {
      ws.once("message", (data) => {
        const parsedData = JSON.parse(data);
        console.log(parsedData);
        resolve(parsedData);
      });
    });
  };

  test("Create user, onramp INR, and check balance", async () => {
    const userId = "testUser1";
    await axios.post(`${HTTP_SERVER_URL}/user/create/${userId}`);

    const onrampResponse = await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId,
      amount: 1000000,
    });

    expect(onrampResponse.status).toBe(200);

    const balanceResponse = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${userId}`
    );
    expect(balanceResponse.data.response).toEqual({
      balance: 1000000,
      locked: 0,
    });
  });

  test("Create symbol and check orderbook", async () => {
    const symbol = "TEST_SYMBOL_30_Dec_2024";
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);

    const orderbookResponse = await axios.get(
      `${HTTP_SERVER_URL}/orderbook/${symbol}`
    );
    // expect(orderbookResponse.data.response).toEqual(defaultStockData);
  });

  test("Place buy order for yes stock and check WebSocket response", async () => {
    const userId = "testUser2";
    const symbol = "BTC_USDT_10_Oct_2024_9_30";
    await axios.post(`${HTTP_SERVER_URL}/user/create/${userId}`);
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: userId,
      amount: 1000000,
    });

    await ws.send(
      JSON.stringify({
        type: "subscribe",
        params: {
          eventId: symbol,
          userId: userId,
        },
      })
    );

    const promisified = waitForWSMessage();

    const buyOrderResponse = await axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId: userId,
      stockSymbol: symbol,
      quantity: 100,
      price: 850,
      stockType: "yes",
    });

    const wsMessage = await promisified;

    expect(buyOrderResponse.status).toBe(200);
    expect(wsMessage.eventId).toBe(symbol);
    const message = wsMessage.data;
    expect(message.no["150"]).toEqual({
      total: 100,
      orders: [
        {
          quantity: 100,
          userId: userId,
          type: "buy",
        },
      ],
    });
  });

  test("Place sell order for no stock and check WebSocket response", async () => {
    const userId = "testUser3";
    const symbol = "ETH_USDT_15_Nov_2024_14_00";
    await axios.post(`${HTTP_SERVER_URL}/user/create/${userId}`);
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: userId,
      amount: 5000000,
    });
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    console.log("create done stock");
    const mint = await axios.post(`${HTTP_SERVER_URL}/trade/mint`, {
      userId: userId,
      stockSymbol: symbol,
      quantity: 200,
      price: 1000,
    });
    console.log("mint done", mint);

    await ws.send(
      JSON.stringify({
        type: "subscribe",
        params: {
          eventId: "ETH_USDT_15_Nov_2024_14_00",
          userId: userId,
        },
      })
    );

    const promisified = waitForWSMessage();
    console.log("ws done");
    const sellOrderResponse = await axios.post(
      `${HTTP_SERVER_URL}/order/sell`,
      {
        userId: userId,
        stockSymbol: symbol,
        quantity: 100,
        price: 200,
        stockType: "no",
      }
    );
    console.log("selling done");
    const wsMessage = await promisified;
    console.log(JSON.stringify(wsMessage));
    expect(sellOrderResponse.status).toBe(200);
    expect(wsMessage.eventId).toBe(symbol);
    const message = wsMessage.data;
    expect(message.no["200"]).toEqual({
      total: 100,
      orders: [
        {
          quantity: 100,
          userId: userId,
          type: "sell",
        },
      ],
    });
  });

  test("Execute matching orders and check WebSocket response", async () => {
    const buyerId = "buyer1";
    const sellerId = "seller1";
    const symbol = "AAPL_USDT_20_Jan_2025_10_00";
    const price = 950;
    const quantity = 50;

    await axios.post(`${HTTP_SERVER_URL}/user/create/${buyerId}`);
    await axios.post(`${HTTP_SERVER_URL}/user/create/${sellerId}`);
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: buyerId,
      amount: 1000000,
    });
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: sellerId,
      amount: 1000000,
    });
    await axios.post(`${HTTP_SERVER_URL}/trade/mint`, {
      userId: sellerId,
      stockSymbol: symbol,
      quantity: 100,
      price: 1000,
    });

    await ws.send(
      JSON.stringify({
        type: "subscribe",
        params: {
          eventId: symbol,
          userId: buyerId,
        },
      })
    );

    const promisified = waitForWSMessage();
    await axios.post(`${HTTP_SERVER_URL}/order/sell`, {
      userId: sellerId,
      stockSymbol: symbol,
      quantity: quantity,
      price: price,
      stockType: "yes",
    });

    await promisified;

    const promisified2 = waitForWSMessage();

    await axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId: buyerId,
      stockSymbol: symbol,
      quantity,
      price,
      stockType: "yes",
    });

    const executionWsMessage = await promisified2;
    console.log(executionWsMessage);
    expect(executionWsMessage.eventId).toBe(symbol);
    // expect(executionWsMessage.data.yes?.[price]).toBeUndefined();

    const buyerStockBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/stock/${buyerId}`
    );
    const sellerInrBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${sellerId}`
    );

    expect(
      buyerStockBalance.data.response.stockBalance[symbol].yes.quantity
    ).toBe(quantity);
    expect(sellerInrBalance.data.response.balance).toBe(
      900000 + price * quantity
    );
  }, 15000);

  test("Execute minting opposite orders with higher quantity and check WebSocket response", async () => {
    const buyerId = "buyer1";
    const buyer2Id = "buyer2";
    const symbol = "AAPL_USDT_20_Jan_2025_10_00";
    const price = 850;
    const quantity = 50;

    await axios.post(`${HTTP_SERVER_URL}/user/create/${buyerId}`);
    await axios.post(`${HTTP_SERVER_URL}/user/create/${buyer2Id}`);
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: buyerId,
      amount: 1000000,
    });
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: buyer2Id,
      amount: 1000000,
    });

    await ws.send(
      JSON.stringify({
        type: "subscribe",
        params: {
          eventId: symbol,
          userId: buyerId,
        },
      })
    );

    const promisified = waitForWSMessage();

    await axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId: buyerId,
      stockSymbol: symbol,
      quantity: quantity,
      price: price,
      stockType: "yes",
    });

    await promisified;

    const promisified2 = waitForWSMessage();

    await axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId: buyer2Id,
      stockSymbol: symbol,
      quantity: quantity + 10,
      price: 1000 - price,
      stockType: "no",
    });

    const executionWsMessage = await promisified2;

    const message = executionWsMessage.data;

    expect(executionWsMessage.eventId).toBe(symbol);
    // expect(message.no?.[1000 - price]).toBeUndefined();
    expect(message.yes?.[price]).toEqual({
      total: 10,
      orders: [
        {
          quantity: 10,
          userId: buyer2Id,
          type: "buy",
        },
      ],
    });
  });

  test("Execute buying stocks from multiple users and check WebSocket response", async () => {
    const buyerId = "buyer1";
    const buyer2Id = "buyer2";
    const buyer3Id = "buyer3";
    const symbol = "AAPL_USDT_20_Jan_2025_10_00";
    const price = 850;
    const quantity = 50;

    await axios.post(`${HTTP_SERVER_URL}/user/create/${buyerId}`);
    await axios.post(`${HTTP_SERVER_URL}/user/create/${buyer2Id}`);
    await axios.post(`${HTTP_SERVER_URL}/user/create/${buyer3Id}`);
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: buyerId,
      amount: 1000000,
    });
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: buyer2Id,
      amount: 1000000,
    });
    await axios.post(`${HTTP_SERVER_URL}/onramp/inr`, {
      userId: buyer3Id,
      amount: 1000000,
    });

    await ws.send(JSON.stringify({ type: "subscribe", stockSymbol: symbol }));

    const promisified = waitForWSMessage();

    axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId: buyerId,
      stockSymbol: symbol,
      quantity,
      price,
      stockType: "yes",
    });

    await promisified;

    const promisified2 = waitForWSMessage();
    axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId: buyer2Id,
      stockSymbol: symbol,
      quantity: quantity + 20,
      price,
      stockType: "yes",
    });

    await promisified2;

    const promisified3 = waitForWSMessage();
    axios.post(`${HTTP_SERVER_URL}/order/buy`, {
      userId: buyer3Id,
      stockSymbol: symbol,
      quantity: 2 * quantity + 30,
      price: 1000 - price,
      stockType: "no",
    });

    console.log((1000 - price) * (2 * quantity + 30));
    const executionWsMessage = await promisified3;
    const message = executionWsMessage.data;

    expect(executionWsMessage.eventId).toBe(symbol);
    //   expect(message.no?.[(1000 - price) / 100]).toBeUndefined();
    expect(message.yes?.[price]).toEqual({
      total: 10,
      orders: [
        {
          quantity: 10,
          userId: buyer3Id,
          type: "buy",
        },
      ],
    });

    const buyerStockBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/stock/${buyerId}`
    );
    const buyer2StockBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/stock/${buyer2Id}`
    );
    const buyer3StockBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/stock/${buyer3Id}`
    );

    expect(
      buyerStockBalance.data.response.stockBalance[symbol].yes.quantity
    ).toBe(quantity);
    expect(
      buyer2StockBalance.data.response.stockBalance[symbol].yes.quantity
    ).toBe(quantity + 20);
    expect(
      buyer3StockBalance.data.response.stockBalance[symbol].no.quantity
    ).toBe(2 * quantity + 20);

    const buyerInrBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${buyerId}`
    );
    const buyer2InrBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${buyer2Id}`
    );
    const buyer3InrBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${buyer3Id}`
    );

    expect(buyerInrBalance.data.response.balance).toBe(
      1000000 - price * quantity
    );
    expect(buyer2InrBalance.data.response.balance).toBe(
      1000000 - price * (quantity + 20)
    );
    expect(buyer3InrBalance.data.response.balance).toBe(
      1000000 - (1000 - price) * (2 * quantity + 30)
    );
  }, 20000);

  test("Execute minting the opposing selling orders and check WebSocket response", async () => {
    const seller1Id = "seller1";
    const seller2Id = "seller2";
    const seller3Id = "seller3";
    const symbol = "AAPL_USDT_20_Jan_2025_10_00";
    const sell1Price = 750;
    const sell2Price = 150;
    const sell3Price = 250;
    const quantity1 = 50;
    const quantity2 = 20;
    const quantity3 = 40;

    await axios.post(`${HTTP_SERVER_URL}/user/create/${seller1Id}`);
    await axios.post(`${HTTP_SERVER_URL}/user/create/${seller2Id}`);
    await axios.post(`${HTTP_SERVER_URL}/user/create/${seller3Id}`);
    await axios.post(`${HTTP_SERVER_URL}/symbol/create/${symbol}`);
    await axios.post(`${HTTP_SERVER_URL}/trade/mint`, {
      userId: seller1Id,
      stockSymbol: symbol,
      quantity: 100,
      price: 1000,
    });
    await axios.post(`${HTTP_SERVER_URL}/trade/mint`, {
      userId: seller2Id,
      stockSymbol: symbol,
      quantity: 100,
      price: 1000,
    });
    await axios.post(`${HTTP_SERVER_URL}/trade/mint`, {
      userId: seller3Id,
      stockSymbol: symbol,
      quantity: 100,
      price: 1000,
    });
    await ws.send(
      JSON.stringify({
        type: "subscribe",
        params: {
          eventId: symbol,
          userId: seller1Id,
        },
      })
    );

    const promisified = waitForWSMessage();

    await axios.post(`${HTTP_SERVER_URL}/order/sell`, {
      userId: seller1Id,
      stockSymbol: symbol,
      quantity: quantity1,
      price: sell1Price,
      stockType: "yes",
    });

    await promisified;

    const promisified2 = waitForWSMessage();
    await axios.post(`${HTTP_SERVER_URL}/order/sell`, {
      userId: seller2Id,
      stockSymbol: symbol,
      quantity: quantity2,
      price: sell2Price,
      stockType: "no",
    });

    await promisified2;

    const promisified3 = waitForWSMessage();

    await axios.post(`${HTTP_SERVER_URL}/order/sell`, {
      userId: seller3Id,
      stockSymbol: symbol,
      quantity: quantity3,
      price: sell3Price,
      stockType: "no",
    });

    const executionWsMessage = await promisified3;
    const message = executionWsMessage.data;

    expect(executionWsMessage.eventId).toBe(symbol);
    //   expect(message.yes?.[sell1Price / 100]).toBeUndefined();
    expect(message.no?.[sell3Price]).toEqual({
      total: 10,
      orders: [
        {
          quantity: 10,
          userId: seller3Id,
          type: "sell",
        },
      ],
    });

    const seller1StockBalace = await axios.get(
      `${HTTP_SERVER_URL}/balance/stock/${seller1Id}`
    );
    const seller2StockBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/stock/${seller2Id}`
    );
    const seller3StockBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/stock/${seller3Id}`
    );

    expect(
      seller1StockBalace.data.response.stockBalance[symbol].yes.quantity
    ).toBe(50);
    expect(
      seller2StockBalance.data.response.stockBalance[symbol].no.quantity
    ).toBe(80);
    expect(
      seller3StockBalance.data.response.stockBalance[symbol].no.quantity
    ).toBe(60);

    const seller1InrBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${seller1Id}`
    );
    const seller2InrBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${seller2Id}`
    );
    const seller3InrBalance = await axios.get(
      `${HTTP_SERVER_URL}/balance/inr/${seller3Id}`
    );

    expect(seller1InrBalance.data.response.balance).toBe(
      sell1Price * quantity1
    );
    expect(seller2InrBalance.data.response.balance).toBe(
      sell2Price * quantity2
    );
    expect(seller3InrBalance.data.response.balance).toBe(
      sell3Price * (quantity3 - 10)
    );
  }, 20000);
});
