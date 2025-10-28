import RestaurantApplication from "../modals/restaurantApplicationModel.js";
import Restaurant from "../modals/restaurantModel.js";

// ✅ Public - Apply for restaurant
export const applyForRestaurant = async (req, res) => {
  try {
    const { name, email, phone, location, cuisineType, description } = req.body;

    const existingApp = await RestaurantApplication.findOne({ email });
    if (existingApp) {
      return res.status(400).json({ success: false, message: "Application already submitted" });
    }

    const newApp = await RestaurantApplication.create({
      name,
      email,
      phone,
      location,
      cuisineType,
      description,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    res.status(201).json({ success: true, message: "Application submitted successfully", data: newApp });
  } catch (err) {
    console.error("Apply Error:", err.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Admin - Get all applications
export const getAllApplications = async (req, res) => {
  try {
    const apps = await RestaurantApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

// ✅ Admin - Approve application
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await RestaurantApplication.findById(id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    // Create actual restaurant entry
    const newRestaurant = await Restaurant.create({
      name: app.name,
      location: app.location,
      cuisineType: app.cuisineType,
      description: app.description,
      image: app.image,
      approved: true,
    });

    app.status = "approved";
    await app.save();

    res.json({ success: true, message: "Application approved", restaurant: newRestaurant });
  } catch (err) {
    res.status(500).json({ success: false, message: "Approval failed" });
  }
};

// ✅ Admin - Reject application
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await RestaurantApplication.findByIdAndUpdate(id, { status: "rejected" }, { new: true });
    res.json({ success: true, message: "Application rejected", data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: "Rejection failed" });
  }
};
