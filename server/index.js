const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// 🔥 서버 생성
const server = http.createServer(app);

// 🔥 socket.io 연결
const io = new Server(server, {
  cors: {
    origin: "https://yousei-delivery.vercel.app",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: "https://yousei-delivery.vercel.app",
  credentials: true
}));

app.use(express.json());

// 테스트
app.get("/", (req, res) => {
  res.send("서버 연결 성공!");
});

// 🔥 socket.io 이벤트
io.on("connection", (socket) => {
  console.log("유저 연결됨:", socket.id);

  socket.on("createRoom", (roomId) => {
    socket.join(roomId);
    console.log("방 생성:", roomId);
  });

  socket.on("disconnect", () => {
    console.log("유저 나감");
  });
});

// 🔥 여기 중요 (app.listen ❌)
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("서버 실행됨:", PORT);
});