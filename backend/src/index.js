import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import authRoutes from "./routes/auth.js";
import matchRoutes from "./routes/match.js";
import submitRoutes from "./routes/submit.js";
import { initSocket } from "./socket.js";
import connectDB from "./db/connectDB.js";
import apiRoutes from "./routes/api.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: ["http://localhost:5173", "https://battleide02.vercel.app"],
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(express.json()); // This line is required!

await connectDB();

// API routes
app.use("/auth", authRoutes);
app.use("/match", matchRoutes);
app.use("/submit", submitRoutes);
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// init socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
