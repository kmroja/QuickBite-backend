// modals/restaurantModel.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    cuisineType: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    openingHours: { type: String },
    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    // NEW: owner field linking to a User who has role 'restaurant' (optional)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

const Restaurant =
  mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
