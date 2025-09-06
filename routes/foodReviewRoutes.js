import express from "express";
import { addFoodReview, getItemReviews } from "../controllers/foodReviewController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// POST a review for an item (requires login)
router.post("/:id/review", authMiddleware(), addFoodReview);

// GET all reviews for a specific item
router.get("/:id/reviews", getItemReviews);

export default router;
