import express from "express";
import {
  loginUser,
  registerUser,
  getProfile,
  getAllUsers,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/profile", authMiddleware(), getProfile);
userRouter.get("/all-users", authMiddleware(["admin"]), getAllUsers);

export default userRouter;
