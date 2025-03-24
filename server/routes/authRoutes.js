import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import mongoose from "mongoose";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const handleError = (res, error, message = "Something went wrong!") => {
  console.error(error);
  return res.status(500).json({ message, error: error.message });
};

const validateObjectId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  return true;
};

router.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/register", upload.single("image"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      origin,
      currentLocation,
      birthDate,
      gender,
      maritalStatus,
      education,
      occupation,
    } = req.body;

    let profilePicture = req.file
      ? `data:image/png;base64,${req.file.buffer.toString("base64")}`
      : "";

    if (!firstName || !username || !password) {
      return res
        .status(400)
        .json({ message: "First name, username, and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName: lastName || "",
      username,
      email: email || "",
      password: hashedPassword,
      origin: origin || "",
      currentLocation: currentLocation || "",
      birthDate: birthDate || "",
      gender: gender || "",
      maritalStatus: maritalStatus || "",
      education: education || "",
      occupation: occupation || "",
      profilePicture,
    });

    await newUser.save();

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateFields = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/follow", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    if (
      !validateObjectId(followerId, res) ||
      !validateObjectId(followingId, res)
    )
      return;
    if (followerId === followingId)
      return res.status(400).json({ message: "You cannot follow yourself" });

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower || !following)
      return res.status(404).json({ message: "User(s) not found" });
    if (follower.following.includes(followingId))
      return res.status(400).json({ message: "Already following this user" });

    follower.following.push(followingId);
    following.followers.push(followerId);
    await Promise.all([follower.save(), following.save()]);

    res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/unfollow", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    if (
      !validateObjectId(followerId, res) ||
      !validateObjectId(followingId, res)
    )
      return;

    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower || !following)
      return res.status(404).json({ message: "User(s) not found" });
    if (!follower.following.includes(followingId))
      return res.status(400).json({ message: "Not following this user" });

    follower.following.pull(followingId);
    following.followers.pull(followerId);
    await Promise.all([follower.save(), following.save()]);

    res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
