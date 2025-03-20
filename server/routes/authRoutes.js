// authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import mongoose from "mongoose";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// تسجيل مستخدم جديد
// إضافة middleware لرفع الملفات قبل الوصول إلى منطق التسجيل
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    console.log("Received Image:", req.file);

    const { firstName, lastName, username, email, password } = req.body;
    let profilePicture = "";

    if (req.file) {
      profilePicture = `data:image/png;base64,${req.file.buffer.toString(
        "base64"
      )}`;
    }

    if (!firstName || !lastName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This username is taken. Please try another one" });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "This email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      profilePicture, // حفظ الصورة في قاعدة البيانات
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        profilePicture: newUser.profilePicture, // إرسال الصورة مع البيانات
        followers: [],
        following: [],
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
});

// Login route بدون JWT
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // بدل التوكن، رجع رسالة مع بيانات المستخدم
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        followers: [],
        following: [],
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
});
// تعديل بيانات المستخدم
router.put("/:userId", async (req, res) => {
  try {
    const { firstName, lastName, username, email, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { firstName, lastName, username, email, profilePicture },
      { new: true } // للحصول على النسخة المحدثة
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
});

// Route لعملية متابعة المستخدم
router.post("/follow", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    // التحقق إذا كان الـ followerId و followingId صالحين
    if (
      !mongoose.Types.ObjectId.isValid(followerId) ||
      !mongoose.Types.ObjectId.isValid(followingId)
    ) {
      return res.status(400).json({ message: "Invalid user ID(s)" });
    }

    // التحقق إذا كان المستخدم يحاول متابعة نفسه
    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // البحث عن المستخدمين في قاعدة البيانات
    const follower = await User.findById(followerId);
    const following = await User.findById(followingId);

    if (!follower || !following) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    // التحقق إذا كان المستخدم يتابع بالفعل الشخص الآخر
    if (follower.following.includes(followingId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // إضافة المستخدم المتابع إلى المصفوفات الخاصة بكل من المتابع والمُتابَع
    follower.following.push(followingId);
    following.followers.push(followerId);

    // حفظ التغييرات في قاعدة البيانات
    await follower.save();
    await following.save();

    return res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Route لعملية إلغاء متابعة المستخدم
router.post("/unfollow", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    // التحقق إذا كان الـ followerId و followingId صالحين
    if (
      !mongoose.Types.ObjectId.isValid(followerId) ||
      !mongoose.Types.ObjectId.isValid(followingId)
    ) {
      return res.status(400).json({ message: "Invalid user ID(s)" });
    }

    // البحث عن المستخدمين في قاعدة البيانات
    const follower = await User.findById(followerId);
    const following = await User.findById(followingId);

    if (!follower || !following) {
      return res.status(404).json({ message: "User(s) not found" });
    }

    // التحقق إذا كان المستخدم لا يتابع الشخص الآخر
    if (!follower.following.includes(followingId)) {
      return res.status(400).json({ message: "Not following this user" });
    }

    // إزالة المستخدم المتابع من المصفوفات الخاصة بكل من المتابع والمُتابَع
    follower.following.pull(followingId);
    following.followers.pull(followerId);

    // حفظ التغييرات في قاعدة البيانات
    await follower.save();
    await following.save();

    return res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
