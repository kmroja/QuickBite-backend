import userModel from "../modals/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import validator from "validator";

// 🔐 Create JWT token
const createToken = (user) => {
  return jwt.sign(
    { _id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER USER
const registerUser = async (req, res) => {
  const { username, password, email, role, adminKey } = req.body;

  try {
    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({ success: false, message: "User already exists" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Invalid email" });

    if (password.length < 8)
      return res.json({ success: false, message: "Password too short" });

    let userRole = "user";

    if (role === "restaurant") userRole = "restaurant";

    if (role === "admin") {
      if (adminKey !== process.env.ADMIN_SECRET) {
        return res.json({ success: false, message: "Invalid admin key" });
      }
      userRole = "admin";
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role: userRole,
    });

    const token = createToken(user);

    res.status(201).json({ success: true, user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    console.log("Entered Password:", password);

    if (!user) {
      console.log("User not found");
      return res.json({ success: false, message: "User not found" });
    }

    console.log("Stored Hash:", user.password);

    const match = await bcrypt.compare(password, user.password);
    console.log("Password Match:", match);

    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user);

    return res.json({ success: true, user, token });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// VERIFY TOKEN
const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ success: false, message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel
      .findById(decoded._id)
      .select("-password");

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid token user" });

    res.json({ success: true, user });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token" });
  }
};

// GET PROFILE (logged-in user)
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error("GetAllUsers Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// --------------------------------------------------------------------
// 🚀 EXPORT ALL FUNCTIONS (ONLY ONCE) — FIXES YOUR ERROR
// --------------------------------------------------------------------
export {
  registerUser,
  loginUser,
  verifyToken,
  getProfile,
  getAllUsers,
};
