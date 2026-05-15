const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://yousei-delivery.vercel.app",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("유저 연결됨:", socket.id);

  socket.on("createRoom", (roomId) => {
    socket.join(roomId);
    console.log("방 생성:", roomId);
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("방 참가:", roomId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("서버 실행됨:", PORT);
});