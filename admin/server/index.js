import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 absolute path fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
console.log("BUCKET:", process.env.APPWRITE_BUCKET_ID); 
console.log("ENV CHECK:", process.env.APPWRITE_ENDPOINT); // 👈 MUST PRINT VALUE

import express from "express";
import cors from "cors";
import uploadRoute from "./routes/upload.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/upload", uploadRoute);

app.listen(5000, () =>
  console.log("🚀 Server running on http://localhost:5000")
);
