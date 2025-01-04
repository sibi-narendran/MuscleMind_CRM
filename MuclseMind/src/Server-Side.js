import { Server } from "socket.io";
import http from "http";
import fs from "fs";

const dataFilePath = "./utils/Data.json";

// Load data from JSON file
const loadData = () => {
  try {
    const rawData = fs.readFileSync(dataFilePath, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    console.error("Error reading Data.json:", err);
    return { cards: [] };
  }
};

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const data = loadData();
  socket.emit("dataUpdate", data);

  const interval = setInterval(() => {
    const updatedData = loadData(); 
    socket.emit("dataUpdate", updatedData);
  }, 500);

  socket.on("disconnect", () => {
    clearInterval(interval);
    console.log("User disconnected:", socket.id);
  });
});

// Start WebSocket server
server.listen(4000, () => {
  console.log("WebSocket server running on http://localhost:4000");
});
