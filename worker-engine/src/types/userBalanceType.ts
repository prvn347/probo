interface Balance {
  balance: number;
  locked: number;
}

export type userBalanceType = {
  [userId: string]: Balance;
};
