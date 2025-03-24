import express from "express";
import multer from "multer";
import path from "path";
import Post from "../models/Post.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

const handleError = (res, error, message = "Something went wrong!") => {
  console.error(error);
  return res.status(500).json({ message, error: error.message });
};

const validateObjectId = (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }
  return true;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(
      null,
      `${Date.now()}_${file.fieldname}${path.extname(file.originalname)}`
    ),
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/:userId", async (req, res) => {
  if (!validateObjectId(req.params.userId, res)) return;
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error);
  }
});

router.get("/following/:userId", async (req, res) => {
  if (!validateObjectId(req.params.userId, res)) return;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ author: { $in: user.following } })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { content, author } = req.body;
    if (!content || !author) {
      return res
        .status(400)
        .json({ message: "Content and author are required!" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const newPost = new Post({ content, author, image });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    handleError(res, error);
  }
});

router.put("/:postId", async (req, res) => {
  if (!validateObjectId(req.params.postId, res)) return;
  try {
    const { content, image } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { content, image },
      { new: true }
    );

    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });

    res.status(200).json(updatedPost);
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/:postId/like", async (req, res) => {
  if (!validateObjectId(req.params.postId, res)) return;
  const { userId } = req.body;

  if (!validateObjectId(userId, res)) return;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const likesSet = new Set(post.likes.map((id) => id.toString()));
    if (likesSet.has(userId)) {
      likesSet.delete(userId);
    } else {
      likesSet.add(userId);
    }

    post.likes = Array.from(likesSet);
    await post.save();

    res
      .status(200)
      .json({ message: likesSet.has(userId) ? "Post liked" : "Post unliked" });
  } catch (error) {
    handleError(res, error);
  }
});

router.post("/:postId/comment", async (req, res) => {
  if (!validateObjectId(req.params.postId, res)) return;
  const { userId, content } = req.body;

  if (!validateObjectId(userId, res)) return;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ content, commentUserId: userId });
    await post.save();

    res.status(200).json({ message: "Comment added" });
  } catch (error) {
    handleError(res, error);
  }
});

router.delete("/:postId/delete", async (req, res) => {
  if (!validateObjectId(req.params.postId, res)) return;
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found!" });

    res.status(202).json({ message: "Post Deleted Successfully!" });
  } catch (error) {
    handleError(res, error);
  }
});

export default router;
