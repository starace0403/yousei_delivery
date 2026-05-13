const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 방 데이터
let rooms = {};

io.on("connection", (socket) => {
  console.log("유저 접속:", socket.id);

  socket.emit("roomList", Object.keys(rooms));

  // 🔹 방 생성
  socket.on("createRoom", ({ roomName, username }) => {
    if (rooms[roomName]) {
      socket.emit("errorMessage", "이미 존재하는 방입니다.");
      return;
    }

    rooms[roomName] = {
      host: socket.id,
      users: [{ id: socket.id, name: username }],
    };

    socket.join(roomName);

    socket.emit("roomCreated", { roomId: roomName });

    // 🔥 멤버 목록 전송
    io.to(roomName).emit("userList", rooms[roomName].users);

    io.emit("roomList", Object.keys(rooms));
  });

  // 🔹 방 입장
  socket.on("joinRoom", ({ roomName, username }) => {
    const room = rooms[roomName];

    if (!room) {
      socket.emit("errorMessage", "존재하지 않는 방입니다.");
      return;
    }

    socket.join(roomName);

    room.users.push({ id: socket.id, name: username });

    socket.emit("joinSuccess", { roomId: roomName });

    // 🔥 멤버 목록 업데이트
    io.to(roomName).emit("userList", room.users);
  });

  // 🔹 메시지
  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);
  });

  // 🔥 방 폭파
  socket.on("deleteRoom", (roomName) => {
    const room = rooms[roomName];
    if (!room) return;

    if (room.host !== socket.id) {
      socket.emit("errorMessage", "방장만 삭제 가능");
      return;
    }

    io.to(roomName).emit("roomDeleted");

    io.in(roomName).socketsLeave(roomName);

    delete rooms[roomName];

    io.emit("roomList", Object.keys(rooms));
  });

  // 🔹 연결 종료
  socket.on("disconnect", () => {
    console.log("유저 나감:", socket.id);

    for (let roomName in rooms) {
      const room = rooms[roomName];

      room.users = room.users.filter((u) => u.id !== socket.id);

      // 🔥 멤버 목록 업데이트
      io.to(roomName).emit("userList", room.users);

      // 방 비면 삭제
      if (room.users.length === 0) {
        delete rooms[roomName];
        io.emit("roomList", Object.keys(rooms));
      }
    }
  });
});

server.listen(3000, () => {
  console.log("서버 실행중 (http://localhost:3000)");
});