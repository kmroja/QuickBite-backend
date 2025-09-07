import FoodReview from "../modals/foodReviewModal.js";
import Item from "../modals/item.js";
import mongoose from "mongoose";

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

    // Update avg rating for item
    const stats = await FoodReview.aggregate([
      { $match: { item: new mongoose.Types.ObjectId(itemId) } },
      {
        $group: {
          _id: "$item",
          avgRating: { $avg: "$rating" },
          total: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Item.findByIdAndUpdate(itemId, {
        rating: stats[0].avgRating,
        totalReviews: stats[0].total,
      });
    }

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
