// controllers/restaurantApplicationController.js
import RestaurantApplication from "../modals/restaurantApplicationModel.js";
import bcrypt from "bcryptjs";

// ✅ Apply as Restaurant (Public)
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
    if (!restaurantName || !ownerName || !email || !phone || !address || !cuisine || !password) {
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
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

// ✅ Get all applications (Admin only)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await RestaurantApplication.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch applications." });
  }
};

// ✅ Approve Application
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await RestaurantApplication.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Application approved", app });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to approve." });
  }
};

// ✅ Reject Application
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await RestaurantApplication.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Application rejected", app });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to reject." });
  }
};
