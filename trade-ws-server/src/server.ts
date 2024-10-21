import { WebSocketServer, WebSocket } from "ws";
import { createClient, RedisClientType } from "redis";

const users: {
  [key: string]: {
    eventId: string;
    userId: string;
    ws: any;
  };
} = {};
const event: {
  [key: string]: { users: string[]; host?: string };
} = {};

const client = createClient();
let counter = 0;
const wss = new WebSocketServer({ port: 8080 });

const startServer = async () => {
  await client.connect();
  client.on("error", (err) => console.log("Redis Client Error", err));

  console.log("Connected to redis");
  while (true) {
    try {
      const orders = await client.brPop("orders", 0);
      console.log("order popped");
      // @ts-ignore
      const elementData = orders.element;
      const { eventId } = JSON.parse(elementData);
      const data = JSON.stringify({
        eventId: eventId,
        elementData,
      });
      broadcastToEvent(eventId, data);

      console.log(`Finished processing order for eventId ${eventId}.`);
    } catch (error) {
      console.error("Error processing orders:", error);
    }
  }
};

wss.on("connection", async function connection(ws: WebSocket, client: any) {
  const userWSId = counter++;
  ws.on("error", console.error);

  ws.on("message", function message(message: string) {
    try {
      const data = JSON.parse(message);
      console.log(`Received message ${message} from user ${userWSId}`);
      const type: string = data.type;
      const params = data.params;

      switch (type) {
        case "join":
          joinRoom(ws, params, userWSId);
        case "sell":
          broadcastToRoom(ws, message, userWSId);

        case "leave":
          leaveRoom(userWSId, ws);
      }
    } catch (error) {
      console.error(error);
    }
  });

  ws.send("connected");
  ws.on("close", () => {
    leaveRoom(userWSId, ws);
  });
});

const joinRoom = (
  ws: WebSocket,
  params: { userId: string; eventId: string },
  userWsId: number
) => {
  try {
    if (!event[params.eventId]) {
      event[params.eventId] = { users: [] };
    }
    event[params.eventId].users.push(params.userId);
    users[userWsId] = {
      eventId: params.eventId,
      userId: params.userId,
      ws,
    };

    const message = {
      type: "connected users",
      users: event[params.eventId].users,
    };

    broadcastToRoom(ws, message, userWsId, true);
  } catch (error) {
    console.log(error);
  }
};
function leaveRoom(wsId: number, ws: WebSocket) {
  const user = users[wsId];
  if (user) {
    const { eventId, userId } = user;
    console.log(`User ${userId} (ID: ${wsId}) left event ${eventId}`);

    // Remove user from room
    event[eventId].users = event[eventId].users.filter(
      (user) => user !== userId
    );
    // if (event[eventId].host === userId && event[room].users.length > 0) {
    //   event[eventId].host = event[room].users[0]; // Assign new host if host leaves
    // }
    // Broadcast updated user list
    const message = {
      type: "userList",
      users: event[eventId].users,
      // host: event[eventId].host,
    };

    broadcastToRoom(user.ws, message, wsId, true);

    // Remove user from users object
    delete users[wsId];
  }
}

function broadcastToEvent(eventId: string, message: any) {
  Object.values(users).forEach(({ ws, eventId: userEventId }) => {
    if (userEventId === eventId) {
      ws.send(JSON.stringify(message));
    }
  });
}

function broadcastToRoom(
  sender: WebSocket,
  message: any,
  userWsId: number,
  includeSender = false
) {
  try {
    const eventId = users[userWsId].eventId;

    if (!users || !users[userWsId]) return;

    Object.keys(users).forEach((wsId) => {
      if (
        users[wsId].eventId === eventId &&
        (includeSender || users[wsId].ws !== sender)
      ) {
        users[wsId].ws.send(JSON.stringify(message));
      }
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
console.log("WebSocket server running on ws://localhost:8080");
