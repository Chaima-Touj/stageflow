import dotenv from "dotenv";
dotenv.config(); // Dima hiyya el loula bech el clé taqra mrigla

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/auth.js";
import offerRoutes from "./routes/offers.js";
import applicationRoutes from "./routes/applications.js";
import userRoutes from "./routes/users.js";
import chatbotRoutes from "./routes/chatbot.js";
import messageRoutes from "./routes/messages.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration CORS
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- DEBUG SECTION ---
// Houni nthabtou el clé mte3 Gemini (mouch OpenAI)
console.log("-----------------------------------------");
console.log("🚀 StageFlow Server Starting...");
console.log("🔑 Gemini API Key:", process.env.GEMINI_API_KEY ? "✅ LOADED" : "❌ MISSING");
console.log("-----------------------------------------");

// Mounting Routes
app.use("/api/auth", authRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatbotRoutes); // Hedhi elli fiha el code mte3 Gemini
app.use("/api/messages", messageRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/stageflow";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
    app.listen(PORT, () => console.log(`🚀 API StageFlow accessible on http://localhost:${PORT} AND http://192.168.1.15:${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });