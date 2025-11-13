import userModel from "../modals/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

// 🔑 CREATE TOKEN (store _id, role, email)
const createToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// 🧑‍💻 REGISTER USER
const registerUser = async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Enter a valid email" });

    if (password.length < 8)
      return res.json({ success: false, message: "Password too short" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Role handling
    let userRole = "user"; // default
    if (role === "restaurant") userRole = "restaurant";
    if (role === "admin") {
      // only existing admins can create another admin
      if (req.user?.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Only admins can create admin users" });
      }
      userRole = "admin";
    }

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const savedUser = await newUser.save();
    const token = createToken(savedUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🔐 LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.json({ success: false, message: "User doesn't exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👤 GET PROFILE (logged-in user)
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 👥 ADMIN: GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error("GetAllUsers Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { registerUser, loginUser, getProfile, getAllUsers };
