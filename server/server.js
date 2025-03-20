import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const corsOptions = {
  origin: "http://localhost:3000", // عنوان الفرونت إند
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true, // إذا كنت تستخدم الكوكيز
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); // لجعل الصور متاحة عبر رابط

// استيراد المسارات
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// إضافة المسارات إلى السيرفر
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use("/uploads", express.static("uploads"));
