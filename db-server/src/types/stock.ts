import { Market } from "@prisma/client";
import { string } from "zod";

export type MarketType = {
  symbol: string;
  starttime:string,
  endtime: string;
  description: string;
  source_of_truth: string;

};


export type marketType = {
  clientId:string
}