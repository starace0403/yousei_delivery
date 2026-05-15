const express = require("express");
const cors = require("cors");

const app = express();

// 🔥 CORS 설정 (여기가 핵심)
app.use(cors({
  origin: "https://yousei-delivery.vercel.app", // 너 프론트 주소
  credentials: true
}));

app.use(express.json());

// 테스트용 API
app.get("/", (req, res) => {
  res.send("서버 연결 성공!");
});

// 예시 API
app.get("/api/test", (req, res) => {
  res.json({ message: "백엔드 정상 작동!" });
});

// 포트 설정 (Render용)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("서버 실행됨:", PORT);
});