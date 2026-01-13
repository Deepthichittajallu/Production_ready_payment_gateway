import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 SERVE STATIC FILES (THIS IS THE MISSING PIECE)
app.use(express.static(path.join(__dirname, "../public")));

app.listen(8000, () => {
  console.log("Server running on port 8000");
});