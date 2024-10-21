import { RedisClientType } from "@redis/client";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";

export class redisManager {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private static instance: redisManager;

  constructor() {
    this.client = createClient();
    this.client.connect();
    this.publisher = createClient();
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
}
