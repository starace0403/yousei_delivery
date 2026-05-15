import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://yousei-delivery.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");

  const [roomId, setRoomId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const [isHost, setIsHost] = useState(false);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("roomList", (roomList) => {
      setRooms(roomList);
    });

    socket.on("roomCreated", (data) => {
      setRoomId(data.roomId);
      setIsHost(true);
    });

    socket.on("joinSuccess", (data) => {
      setRoomId(data.roomId);
      setIsHost(false);
    });

    socket.on("userList", (users) => {
      setUserList(users);
    });

    socket.on("roomDeleted", () => {
      alert("방장으로 인해 방이 사라졌습니다.");
      setRoomId("");
      setMessages([]);
      setIsHost(false);
      setUserList([]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("roomList");
      socket.off("roomCreated");
      socket.off("joinSuccess");
      socket.off("userList");
      socket.off("roomDeleted");
    };
  }, []);

  const sendMessage = () => {
    if (!message || !username || !roomId) return;

    socket.emit("sendMessage", {
      roomId,
      username,
      message,
    });

    setMessage("");
  };

  const createRoom = () => {
    socket.emit("createRoom", {
      roomName: newRoomName,
      username: username,
    });
  };

  const joinRoom = () => {
    if (!selectedRoom) {
      alert("방을 선택하세요");
      return;
    }

    socket.emit("joinRoom", {
      roomName: selectedRoom,
      username: username,
    });
  };

  const deleteRoom = () => {
    socket.emit("deleteRoom", roomId);
  };

  // 👉 채팅방 내부
  if (roomId) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>연세 배달 모아</h1>
        <h2>채팅방 이름 : {roomId}</h2>
        <h4>{isHost ? "👑 방장" : "참여자"}</h4>

        {isHost && (
          <button
            onClick={deleteRoom}
            style={{ backgroundColor: "red", color: "white" }}
          >
            방 폭파
          </button>
        )}

        <div style={{ margin: "10px 0" }}>
          <b>멤버:</b>{" "}
          {userList.map((u, i) => (
            <span key={i}>
              {u.name}
              {i !== userList.length - 1 && ", "}
            </span>
          ))}
        </div>

        <div
          style={{
            border: "1px solid black",
            height: "300px",
            overflowY: "scroll",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          {messages.map((msg, index) => (
            <div key={index}>
              <b>{msg.username}</b>: {msg.message}
            </div>
          ))}
        </div>

        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지 입력"
        />
        <button onClick={sendMessage}>보내기</button>
      </div>
    );
  }

  // 👉 메인 화면
  return (
    <div style={{ padding: "20px" }}>
      <h1>연세 배달 모아</h1>

      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="이름 입력"
      />

      <br /><br />

      <input
        value={newRoomName}
        onChange={(e) => setNewRoomName(e.target.value)}
        placeholder="방 이름 입력"
      />
      <button onClick={createRoom}>방 만들기</button>

      <h2>현재 방 목록</h2>

      {rooms.length === 0 ? (
        <p>현재 존재하는 방이 없습니다.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {rooms.map((room, index) => {
            const isSelected = selectedRoom === room;

            return (
              <div
                key={index}
                onClick={() => setSelectedRoom(room)}
                style={{
                  width: "200px",
                  height: "100px",
                  border: isSelected
                    ? "3px solid #007bff"
                    : "1px solid gray",
                  borderRadius: "12px",
                  backgroundColor: isSelected
                    ? "#cce5ff"
                    : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "0.2s",
                  transform: isSelected ? "scale(1.05)" : "scale(1)",
                  boxShadow: isSelected
                    ? "0 0 10px rgba(0,0,0,0.2)"
                    : "none",
                }}
              >
                {room}
              </div>
            );
          })}
        </div>
      )}

      <br />

      <button onClick={joinRoom}>선택한 방 입장</button>
    </div>
  );
}

export default App;