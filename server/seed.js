import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();

const connectDB = async () => {
  console.log("🔗 Connecting to:", process.env.MONGO_URL);

  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB connected successfully!");
  } catch (error) {
    console.error(" MongoDB connection failed:", error);
    process.exit(1);
  }
};

// Test Data
const seedData = async () => {
  try {
    await connectDB(); //

    // await User.deleteMany();
    // await Post.deleteMany();

    // Create A New User
    await User.create({
      firstName: "Ali",
      lastName: "Ahmad",
      username: "ali_ahmad",
      email: "ali@example.com",
      password: "hashedpassword",
    });

    await Post.create({
      content: "Hello, this is my first post!",
      author: user._id,
      likes: [user._id],
      comments: [
        {
          content: "My first comment",
          commentUserId: user._id,
        },
        {
          content: "My seconde comment",
          commentUserId: user._id,
        },
      ],
    });

    console.log("Data Seeded Successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error Seeding Data:", error);
    mongoose.connection.close();
  }
};

seedData();
