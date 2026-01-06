// controllers/restaurantApplicationController.js
import RestaurantApplication from "../modals/restaurantApplicationModel.js";
import Restaurant from "../modals/restaurantModel.js";
import userModel from "../modals/userModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";

/**
 * Apply public
 */
export const applyForRestaurant = async (req, res) => {
  try {
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

    if (
      !restaurantName ||
      !ownerName ||
      !email ||
      !phone ||
      !address ||
      !cuisine ||
      !password
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be provided." });
    }

    const existing = await RestaurantApplication.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "You have already applied with this email." });

    const hashedPassword = await bcrypt.hash(password, 10);
    let imageUrl = "";

if (req.file) {
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "quickbite/restaurant-applications",
  });
  imageUrl = result.secure_url;
}

const newApp = new RestaurantApplication({
  restaurantName,
  ownerName,
  email,
  phone,
  address,
  cuisine,
  description,
  password: hashedPassword,
  image: imageUrl,
});


    await newApp.save();

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully! Awaiting admin approval.",
      application: newApp,
    });
  } catch (err) {
    console.error("❌ Apply Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
  }
};

/**
 * APPROVE – Create Restaurant + Restaurant User + Link
 */
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const app = await RestaurantApplication.findById(id);
    if (!app)
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });

    if (app.status === "approved")
      return res
        .status(400)
        .json({ success: false, message: "Already approved." });

    // Check if restaurant already exists by name
    let restaurant = await Restaurant.findOne({ name: app.restaurantName });

    if (!restaurant) {
      restaurant = await Restaurant.create({
        name: app.restaurantName,
        address: app.address,
        cuisine: app.cuisine,
        description: app.description || "",
        image: app.image || "",
        owner: null,
        menuItems: [],
        rating: 0,
        totalReviews: 0,
      });
    }

    // Create restaurant user if not exists
    let restaurantUser = await userModel.findOne({ email: app.email });

    if (!restaurantUser) {
      restaurantUser = await userModel.create({
        username: app.ownerName,
        email: app.email,
        password: app.password, // Already hashed
        role: "restaurant",
      });
    } else {
      // Update existing user to restaurant role
      if (restaurantUser.role !== "restaurant") {
        restaurantUser.role = "restaurant";
        await restaurantUser.save();
      }
    }

    // Link owner to restaurant
    restaurant.owner = restaurantUser._id;
    await restaurant.save();

    // Update application status
    app.status = "approved";
    await app.save();

    return res.status(200).json({
      success: true,
      message: "Application approved. Restaurant created successfully.",
      application: app,
      restaurant,
      restaurantUser: {
        _id: restaurantUser._id,
        email: restaurantUser.email,
        role: restaurantUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Approve Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: err.message });
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
