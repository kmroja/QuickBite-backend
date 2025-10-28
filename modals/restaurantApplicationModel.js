import mongoose from "mongoose";

const restaurantApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    location: { type: String, required: true },
    cuisineType: { type: String },
    description: { type: String },
    image: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("RestaurantApplication", restaurantApplicationSchema);
