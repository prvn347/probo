import { createClient, RedisClientType } from "redis";
import { messageToApi, WsMessage } from "./types";
import { DBmessage } from "./types";
export class redisManager {
  private client: RedisClientType;
  private static instance: redisManager;

  constructor() {
    this.client =
      createClient();
      //   {
      //   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      // }
    this.client.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new redisManager();
    }
    return this.instance;
  }
  public pushMessage(message: DBmessage) {
    this.client.lPush("db_processor", JSON.stringify(message));
  }

  public publishMessage(channel: string, message: WsMessage) {
    this.client.publish(channel, JSON.stringify(message));
  }

  public sendToApi(clientId: string, message: messageToApi) {
    this.client.publish(clientId, JSON.stringify(message));
  }
}
