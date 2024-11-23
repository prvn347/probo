import { createClient } from "redis";
import { engineManager } from "./engineManager";
import dotenv from "dotenv";
dotenv.config();

const startEngine = async () => {
  const client = createClient();
  //   {
  //   url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  //    }
  await client.connect();

  client.on("error", (error) => {
    console.log("Error in redis connection" + error);
  });

  console.log("Connected to redis");
  engineManager.getInstance();
  console.log("withsnapshot" + process.env.WITH_SNAPSHOT);
  while (true) {
    try {
      const response = await client.brPop("message", 0);
      console.log("order popped");
      console.log(response?.element);
      // @ts-ignore
      engineManager.getInstance().processResponse(JSON.parse(response.element));

      console.log(`Finished processing the data.`);
    } catch (error) {
      console.error("Error processing orders:", error);
    }
  }
};

startEngine();
