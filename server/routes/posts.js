import express from "express";
import { getFeedPosts, getUserPosts, likePost, addComment } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import { validateToxicity } from "../helpers/validate-toxicity.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);
router.post("/:id/comment", verifyToken, validateToxicity, addComment); // New route for adding comments

export default router;