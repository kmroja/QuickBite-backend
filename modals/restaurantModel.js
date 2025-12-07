// models/restaurantModel.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    cuisine: { type: String, required: true },
    description: { type: String },

    image: { type: String },

    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    openingHours: { type: String },

    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    // ⭐ NEW – restaurant approval system
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
