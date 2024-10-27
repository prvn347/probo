export interface Order {
  quantity: number;
  userId: string;
  type: "buy" | "sell";
}

export interface PriceLevel {
  total: number;
  orders: Order[];
}

interface TokenType {
  [price: string]: PriceLevel;
}

interface Symbol {
  yes: TokenType;
  no: TokenType;
}

export interface OrderBook {
  [symbol: string]: Symbol;
}
