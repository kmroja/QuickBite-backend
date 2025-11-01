// controllers/restaurantApplicationController.js
import RestaurantApplication from "../modals/restaurantApplicationModel.js";
import bcrypt from "bcryptjs";

/* -------------------------------------------------------------------------- */
/* ✅ 1. Apply as Restaurant (Public)                                         */
/* -------------------------------------------------------------------------- */
export const applyForRestaurant = async (req, res) => {
  try {
    console.log("📥 Incoming Restaurant Application:", req.body);

    const {
      restaurantName,
      ownerName,
      email,
      phone,
      address,
      cuisine,
      description,
      password,
    } = req.body;

    // ✅ Validate required fields
    if (
      !restaurantName ||
      !ownerName ||
      !email ||
      !phone ||
      !address ||
      !cuisine ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // ✅ Check if already applied
    const existing = await RestaurantApplication.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied with this email.",
      });
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save image (if uploaded)
    const imagePath = req.file ? `/uploads/${req.file.filename}` : "";

    // ✅ Create new application
    const newApp = new RestaurantApplication({
      restaurantName,
      ownerName,
      email,
      phone,
      address,
      cuisine,
      description,
      password: hashedPassword,
      image: imagePath,
    });

    await newApp.save();
    console.log("✅ Application saved:", newApp._id);

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! Awaiting admin approval.",
      application: newApp,
    });
  } catch (err) {
    console.error("❌ Apply Error:", err);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: err.message,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ 2. Get All Applications (Admin only)                                    */
/* -------------------------------------------------------------------------- */
export const getAllApplications = async (req, res) => {
  try {
    const applications = await RestaurantApplication.find().sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    console.error("❌ Fetch All Applications Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch applications." });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ 3. Get Pending Applications (Admin only)                                */
/* -------------------------------------------------------------------------- */
export const getPendingApplications = async (req, res) => {
  try {
    const pending = await RestaurantApplication.find({ status: "pending" });
    res.status(200).json({
      success: true,
      message: "Fetched all pending applications.",
      data: pending,
    });
  } catch (error) {
    console.error("❌ Fetch Pending Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ 4. Approve Application (Admin only)                                     */
/* -------------------------------------------------------------------------- */
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await RestaurantApplication.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    res.status(200).json({
      success: true,
      message: "Application approved successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Approve Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/* -------------------------------------------------------------------------- */
/* ✅ 5. Reject Application (Admin only)                                      */
/* -------------------------------------------------------------------------- */
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await RestaurantApplication.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    res.status(200).json({
      success: true,
      message: "Application rejected successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Reject Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
