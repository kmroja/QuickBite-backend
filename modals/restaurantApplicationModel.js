import mongoose from "mongoose";

const restaurantApplicationSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    cuisine: { type: String, required: true },
    description: { type: String },
    password: { type: String, required: true },
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
