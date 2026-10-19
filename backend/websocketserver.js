import http from "http";
import express from "express";
import { WebSocketServer } from "ws";

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server ONCE
const wss = new WebSocketServer({
  server,
});

// Express route
app.get("/", (req, res) => {
  res.send("WebSocket server is running");
});

// Listen for websocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.send("Welcome to the WebSocket server!");

  ws.on("message", (message) => {
    const text = message.toString();

    console.log(`Received message: ${text}`);

    ws.send(`Server received: ${text}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (err) => {
    console.log(err);
  });
});

// Start HTTP server
server.listen(3002, () => {
  console.log("Server running on 3002");
});
