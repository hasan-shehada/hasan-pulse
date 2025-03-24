import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

const checkData = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(" Connected to MongoDB");

    const users = await User.find();
    const posts = await Post.find();

    console.log(" Users in DB:", users);
    console.log(" Posts in DB:", posts);

    mongoose.connection.close();
  } catch (error) {
    console.error(" Error:", error);
    mongoose.connection.close();
  }
};

checkData();
