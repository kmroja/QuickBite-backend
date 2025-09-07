import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 }, // average rating
    hearts: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }, // count of reviews
    imageUrl: { type: String },
    reviews: [reviewSchema], // ⬅ embedded reviews
  },
  { timestamps: true }
);

const Item = mongoose.models.Item || mongoose.model("Item", itemSchema);

export default Item;
