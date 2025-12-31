import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  item: {
    name: String,
    price: Number,
    imageUrl: String,
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
       required: true,
    },
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },

    address: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },

    items: [orderItemSchema],

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      default: "pending",
    },

    transactionId: String,
    sessionId: String,

    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },

  status: {
  type: String,
  enum: ["pending", "confirmed", "cancelled", "delivered"],
  default: "pending"
},

  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
