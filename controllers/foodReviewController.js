import Item from "../modals/item.js";

// ➕ Add a review directly inside an item
export const addFoodReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user?._id;
    const itemId = req.params.id;

    // ✅ Validate rating and comment explicitly
    if (
      rating === undefined ||
      rating === null ||
      comment === undefined ||
      comment.trim() === ""
    ) {
      return res.status(400).json({ message: "Rating and comment required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not found in token" });
    }

    // ✅ Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Check if user already reviewed
    const alreadyReviewed = item.reviews.find(
      (rev) => rev.user?.toString() === userId.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this item" });
    }

    // ✅ Push new review
    const newReview = { user: userId, rating, comment };
    item.reviews.push(newReview);

    // ✅ Update total reviews and average rating
    item.totalReviews = item.reviews.length;
    item.rating =
      item.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / item.totalReviews;

    await item.save();

    res.status(201).json({ message: "Review added successfully", review: newReview });
  } catch (err) {
    console.error("❌ Error adding review:", err);
    res.status(500).json({ message: "Error adding review", error: err.message });
  }
};


// 📖 Get all reviews for an item
export const getItemReviews = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await Item.findById(itemId).populate("reviews.user", "name email");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item.reviews);
  } catch (err) {
    console.error("❌ Error fetching reviews:", err);
    res.status(500).json({ message: "Error fetching reviews", error: err.message });
  }
};
