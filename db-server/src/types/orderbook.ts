export type sellOrderType = {
  id: string;
  userId: string;
  marketId: string;
  side: string;
  type: string;
  quantity: number;
  price: number;
  filled_quantity?: number;
};

export type tradeType = {
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
};
