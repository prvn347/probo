interface stockQuanitityType {
  quantity: number;
  locked: number;
}

interface Stock {
  yes: stockQuanitityType;
  no: stockQuanitityType;
}

interface stockSymbol {
  [stockName: string]: Stock;
}

export type stockBalance = {
  [userId: string]: stockSymbol;
};
export interface OnrampRequest {
  userId: string;
  amount: number;
}

// sell order request body
export interface OrderRequestBody {
  userId: string;
  stockSymbol: string;
  quantity: number;
  price: number;
  stockType: "yes" | "no";
}
