// controllers/restaurantApplicationController.js
import RestaurantApplication from "../modals/restaurantApplicationModel.js";
import Restaurant from "../modals/restaurantModel.js";
import userModel from "../modals/userModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
/**
 * Apply public
 */
export const applyForRestaurant = async (req, res) => {
  try {
    const { restaurantName, ownerName, phone, address, cuisine, description } =
      req.body;

    if (!restaurantName || !ownerName || !phone || !address || !cuisine) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const userId = req.user._id;

    const existing = await RestaurantApplication.findOne({ owner: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied",
      });
    }

    const imageUrl = req.file ? req.file.path : "";

    const application = await RestaurantApplication.create({
      restaurantName,
      ownerName,
      owner: userId,
      phone,
      address,
      cuisine,
      description,
      image: imageUrl,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Application submitted. Awaiting approval",
      application,
    });
  } catch (err) {
    console.error("Apply error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/**
 * APPROVE – Create Restaurant + Restaurant User + Link
 */

export const approveApplication = async (req, res) => {
  try {
    const app = await RestaurantApplication.findById(req.params.id);
    if (!app)
      return res.status(404).json({ success: false, message: "Not found" });

    if (app.status === "approved")
      return res
        .status(400)
        .json({ success: false, message: "Already approved" });

    const user = await userModel.findById(app.owner);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const existingRestaurant = await Restaurant.findOne({
      owner: new mongoose.Types.ObjectId(user._id),
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant already exists for this user",
      });
    }

    // 🔥 UPGRADE ROLE
    user.role = "restaurant";
    await user.save();

    // 🔥 CREATE RESTAURANT (FIXED)
    const restaurant = await Restaurant.create({
      name: app.restaurantName,
      address: app.address,
      cuisine: app.cuisine,
      description: app.description || "",
      image: app.image || "",
      owner: new mongoose.Types.ObjectId(user._id), // ✅ FIX
      status: "approved",
      menu: [],
    });

    app.status = "approved";
    await app.save();

    res.json({
      success: true,
      message: "Approved successfully",
      restaurantId: restaurant._id,
    });
  } catch (err) {
    console.error("Approve error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




/**
 * Get only pending
 */
export const getPendingApplications = async (req, res) => {
  try {
    const pending = await RestaurantApplication.find({ status: "pending" }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "Fetched pending applications",
      data: pending,
    });
  } catch (err) {
    console.error("❌ Fetch Pending Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * Get all applications
 */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await RestaurantApplication.find().sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error("❌ Fetch All Applications Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch applications." });
  }
};

/**
 * Reject
 */
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const app = await RestaurantApplication.findById(id);
    if (!app)
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });

    app.status = "rejected";
    await app.save();

    return res.status(200).json({
      success: true,
      message: "Application rejected successfully.",
      application: app,
    });
  } catch (err) {
    console.error("❌ Reject Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};
