import { UserSignupType } from "@/types";
import axios, { AxiosInstance } from "axios";

const BASE_URL = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const createUser = async (userMeta: UserSignupType) => {
  try {
    const response = await axiosInstance.post("/user/signup", userMeta);
    
    const resp = response.data

    localStorage.setItem("token",resp.token)


     const url =  await axiosInstance.post(`/user/create/${resp.result.id}`);
     console.log("has user created "  + url)

    return response;
  } catch (error) {
    throw new Error("Invalid username");
  }
};

export const resetSystem = async () => {
  try {
    const response = await axiosInstance.post("/reset");
    return response.data;
  } catch (error) {
    throw new Error("Failed to reset the system");
  }
};

export const onrampINR = async (userId: string, amount: number) => {
  try {
    const response = await axiosInstance.post("/onramp/inr", {
      userId,
      amount,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to onramp INR");
  }
};

export const createStockSymbol = async (stockSymbol: string) => {
  try {
    const response = await axiosInstance.post(`/symbol/create/${stockSymbol}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create stock symbol");
  }
};

export const mintStock = async (
  userId: string,
  stockSymbol: string,
  quantity: number,
  price: number
) => {
  try {
    const response = await axiosInstance.post("/trade/mint", {
      userId,
      stockSymbol,
      quantity,
      price,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to mint stock");
  }
};

export const getINRBalance = async () => {
  try {
    const token = localStorage.getItem("token")
    const response = await axiosInstance.get(`/balance/inr/rs`,{


      headers:{
        Authorization:`Bearer ${token}`
      }

    });
    return response.data.response;
  } catch (error) {
    throw new Error("Failed to get INR balance");
  }
};

export const getOrderbook = async () => {
  try {
    const response = await axiosInstance.get("/orderbook");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch orderbook");
  }
};

export const getStockOrderbook = async (stockSymbol: string) => {
  try {
    const response = await axiosInstance.get(`/orderbook/${stockSymbol}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch stock orderbook");
  }
};
export const buyStock = async (
  buyerId: string,
  stockSymbol: string,
  quantity: number,
  price: number
) => {
  try {
    const response = await axiosInstance.post("/trade/buy", {
      buyerId,
      stockSymbol,
      quantity,
      price,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to buy stock");
  }
};

export const sellStock = async (
  sellerId: string,
  stockSymbol: string,
  quantity: number,
  price: number
) => {
  try {
    const response = await axiosInstance.post("/trade/sell", {
      sellerId,
      stockSymbol,
      quantity,
      price,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to sell stock");
  }
};
