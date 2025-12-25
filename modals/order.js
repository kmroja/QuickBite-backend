import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  item: {
    name: String,
    price: Number,
    imageUrl: String,
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  quantity: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    email: String,
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    city: String,
    zipCode: String,
    items: [orderItemSchema],
    paymentMethod: {
      type: String,
      enum: ["cod", "online", "card", "upi"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed", "initiated"],
      default: "pending",
    },
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number,
    status: {
      type: String,
      enum: ["processing", "outForDelivery", "delivered"],
      default: "processing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
