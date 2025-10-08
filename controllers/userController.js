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
    // Email exists?
    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User Already Exists" });

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please Enter A Valid Email" });
    }

    // Validate password
    if (password.length < 8) {
      return res.json({ success: false, message: "Please Enter A Strong Password" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Role handling: only admin can assign 'admin' or 'restaurant'
    let userRole = "user";
    if (role && ["admin", "restaurant"].includes(role)) {
      if (req.user?.role !== "admin") {
        return res.status(403).json({ success: false, message: "Only admin can assign this role" });
      }
      userRole = role;
    }

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const user = await newUser.save();
    const token = createToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🔐 LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User Doesn't Exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid Credentials" });

    const token = createToken(user);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 👤 GET LOGGED-IN USER PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 👥 ADMIN-ONLY: GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { loginUser, registerUser, getProfile, getAllUsers };
