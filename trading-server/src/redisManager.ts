import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";

export class redisManager {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private static instance: redisManager;

  constructor() {
    this.client = createClient();
    //   {
    //   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    // }
    this.client.connect();
    this.publisher = createClient();
    //   {
    //   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    // }
    this.publisher.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new redisManager();
    }
    return this.instance;
  }

  public sendAndAwait(data: any, clientId: string) {
    return new Promise<{ clientId: string; responseData: any }>((resolve) => {
      const id = clientId;
      this.client.subscribe(id, (message) => {
        this.client.unsubscribe(id);
        resolve(JSON.parse(message));
      });
      this.publisher.lPush("message", JSON.stringify(data));
    });
  }
  public sendToDb_processor( clientId:string,message: any) {
    return new Promise<any>((resolve) => {
     
      this.client.subscribe(clientId, (message) => {
        this.client.unsubscribe(clientId);
        resolve(JSON.parse(message));
      });
      this.publisher.lPush("MessageToDb_processor", JSON.stringify(message));
    });
  }
  public getRandomClientId() {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
