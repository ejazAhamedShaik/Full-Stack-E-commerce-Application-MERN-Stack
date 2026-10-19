import express from "express";
import {
  addUserHandler,
  deleteUserByIdHandler,
  getUserByIdHandler,
  getUserHandler,
  updateUserByIdHandler,
} from "../controllers/userControllers.js";
import { isBodyEmpty } from "../utils/isBodyEmpty.js";
import { isAdmin, protectRoute } from "../controllers/authController.js";

const userRouter = express.Router();

userRouter.use(protectRoute);

userRouter.get("/", isAdmin, getUserHandler);
userRouter.post("/", isBodyEmpty, addUserHandler);
userRouter.get("/:id", getUserByIdHandler);
userRouter.patch("/:id", isBodyEmpty, updateUserByIdHandler);
userRouter.delete("/:id", deleteUserByIdHandler);

export { userRouter };
