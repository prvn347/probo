export interface OrdersType {
  [quantity: string]: {
    [userId: string]: "buy" | "sell";
  };
}

export interface Order {
  total: number;
  orders: OrdersType;
}

interface PredictionOrders {
  [price: string]: Order;
}

interface PredictionBook {
  [stockType: string]: PredictionOrders;
}

export interface OrderBook {
  [stockSymbol: string]: PredictionBook;
}
