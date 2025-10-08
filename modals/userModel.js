// modals/userModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    // NEW: include restaurant role
    role: {
      type: String,
      enum: ["user", "admin", "restaurant"], // added 'restaurant'
      default: "user",
    },
  },
  { timestamps: true }
);

// Hash password on save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance helper to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  const bcrypt = await import("bcryptjs");
  return bcrypt.default.compare(enteredPassword, this.password);
};

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
