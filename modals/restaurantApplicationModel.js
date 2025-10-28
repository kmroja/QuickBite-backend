// modals/restaurantApplicationModel.js
import mongoose from "mongoose";

const restaurantApplicationSchema = new mongoose.Schema(
  {
    restaurantName: { type: String, required: true }, // ✅ renamed 'name'
    ownerName: { type: String, required: true },       // ✅ new field for owner
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },         // ✅ replaces 'location'
    cuisine: { type: String, required: true },         // ✅ renamed 'cuisineType'
    description: { type: String },
    password: { type: String, required: true },        // ✅ for future restaurant login
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
