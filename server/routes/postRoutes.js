// postRoutes.js
import express from "express";
import Post from "../models/Post.js";
import User from "../models/User.js";

const router = express.Router();

// جلب جميع البوستات
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "username email")
      .sort({ createdAt: -1 }); // ترتيب من الأحدث إلى الأقدم
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// جلب بوستات يوزر معين
router.get("/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

import multer from "multer";
import path from "path";

// تحديد مكان حفظ الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // سيتم حفظ الصور في مجلد uploads
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}_${file.fieldname}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

// تعديل نقطة النهاية لإضافة بوست وصورة
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { content, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : ""; // تأكد من استخدام `req.file`

    if (!content || !author) {
      return res.status(400).json({ message: "المحتوى والمؤلف مطلوبان!" });
    }

    const newPost = new Post({ content, author, image });
    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// جلب بوستات الفولوينغز
router.get("/following/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const followingIds = user.following;

    const posts = await Post.find({ author: { $in: followingIds } })
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// إضافة بوست جديد
router.post("/", async (req, res) => {
  try {
    const { content, author, image } = req.body;
    const newPost = new Post({ content, author, image, likes: [] });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// تعديل بوست معين
router.put("/:postId", async (req, res) => {
  try {
    const { content, image } = req.body; // تعديل الحقول الممكنة
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { content, image },
      { new: true } // للحصول على النسخة المحدثة
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// إضافة لايك لبوست معين
router.post("/:postId/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likes.includes(req.body.userId)) {
      post.likes.push(req.body.userId);
      await post.save();
      return res.status(200).json({ message: "Post liked" });
    } else {
      post.likes = post.likes.filter((id) => id !== req.body.userId);
      await post.save();
      return res.status(200).json({ message: "Post unliked" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// إضافة تعليق لبوست معين
router.post("/:postId/comment", async (req, res) => {
  try {
    const { userId, content } = req.body;
    const post = await Post.findById(req.params.postId);
    post.comments.push({ content, commentUserId: userId });
    await post.save();
    res.status(200).json({ message: "Comment added" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

//Delete Post
router.delete("/:postId/delete", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found!" });
    }

    res.status(202).json({ message: "Post Deleted Successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
