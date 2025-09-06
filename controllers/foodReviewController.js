import FoodReview from "../models/foodReviewModel.js";
import Item from "../models/itemModel.js"; // if you have an Item model

// Add a food review
export const addFoodReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const itemId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment required" });
    }

    const review = await FoodReview.create({
      user: userId,
      item: itemId,
      rating,
      comment,
    });

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding review", error: err.message });
  }
};

// Get all reviews for a specific item
export const getItemReviews = async (req, res) => {
  try {
    const itemId = req.params.id;
    const reviews = await FoodReview.find({ item: itemId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
};
