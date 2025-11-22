// modals/restaurantModel.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    // change "location" to "address"
    address: { type: String, required: true },

    // change "cuisineType" to "cuisine"
    cuisine: { type: String, required: true },

    description: { type: String },

    // change imageUrl → image
    image: { type: String },

    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    openingHours: { type: String },

    menu: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Restaurant", restaurantSchema);
