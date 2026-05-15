const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("서버 연결 성공!");
});

const rooms = {}; // { roomName: [{ id, name }] }

io.on("connection", (socket) => {
  console.log("유저 연결됨:", socket.id);

  // 방 목록 전송
  const sendRoomList = () => {
    io.emit("roomList", Object.keys(rooms));
  };

  // 방 만들기
  socket.on("createRoom", ({ roomName, username }) => {
    if (!rooms[roomName]) {
      rooms[roomName] = [];
    }
    rooms[roomName].push({ id: socket.id, name: username });
    socket.join(roomName);
    socket.emit("roomCreated", { roomId: roomName });
    io.to(roomName).emit("userList", rooms[roomName]);
    sendRoomList();
  });

  // 방 입장
  socket.on("joinRoom", ({ roomName, username }) => {
    if (!rooms[roomName]) return;
    rooms[roomName].push({ id: socket.id, name: username });
    socket.join(roomName);
    socket.emit("joinSuccess", { roomId: roomName });
    io.to(roomName).emit("userList", rooms[roomName]);
    sendRoomList();
  });

  // 메시지 전송
  socket.on("sendMessage", ({ roomId, username, message }) => {
    io.to(roomId).emit("receiveMessage", { username, message });
  });

  // 방 폭파
  socket.on("deleteRoom", (roomId) => {
    io.to(roomId).emit("roomDeleted");
    delete rooms[roomId];
    sendRoomList();
  });

  // 연결 끊김
  socket.on("disconnect", () => {
    for (const roomName in rooms) {
      rooms[roomName] = rooms[roomName].filter(u => u.id !== socket.id);
      if (rooms[roomName].length === 0) {
        delete rooms[roomName];
      }
    }
    sendRoomList();
    console.log("유저 나감:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("서버 실행됨:", PORT);
});