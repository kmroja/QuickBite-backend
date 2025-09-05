import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // only two roles allowed
      default: "user", // default role is user
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
