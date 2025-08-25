import express from "express";
import { getReviews, createReview } from "../controllers/reviewController.js";

const router = express.Router();

// GET all reviews
router.get("/", getReviews);

// POST a review
router.post("/", createReview);

export default router;
