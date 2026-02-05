import Item from "../modals/item.js";

// ➕ Add review
export const addFoodReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user._id;
    const itemId = req.params.id;

    if (!rating || !comment?.trim()) {
      return res.status(400).json({ message: "Rating and comment required" });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    const alreadyReviewed = item.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this item" });
    }

    const review = { user: userId, rating, comment };
    item.reviews.push(review);

    item.totalReviews = item.reviews.length;
    item.rating =
      item.reviews.reduce((sum, r) => sum + r.rating, 0) / item.totalReviews;

    await item.save();

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 📖 Get reviews
export const getItemReviews = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "reviews.user",
      "name email"
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json({
      rating: item.rating,
      totalReviews: item.totalReviews,
      reviews: item.reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};