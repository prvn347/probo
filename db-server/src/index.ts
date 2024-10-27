import { createClient } from "redis";
import { engineManager } from "./engine";
import { dbResponseType } from "./types";

const dbProcessor = async () => {
  const client = createClient();
  await client.connect();
  client.on("error", (error) => {
    console.log("Error in redis connection" + error);
  });

  console.log("Connected to redis");
  while (true) {
    try {
      const response = await client.brPop("db_processor", 0);
      console.log("order popped");

      if (response?.element) {
        const parsedResponse = JSON.parse(response.element) as dbResponseType;
        console.log("Parsed response:", parsedResponse);
        engineManager.getInstance().processDb(parsedResponse);
        console.log(`Finished processing the data.`);
      }
    } catch (error) {
      console.error("Error processing orders:", error);
    }
  }
};

dbProcessor();
