import express from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  resetPasswordHandler,
  signUpHandler,
} from "../controllers/authController.js";
import { isBodyEmpty } from "../utils/isBodyEmpty.js";

const authRouter = express.Router();

authRouter.post("/signup", isBodyEmpty, signUpHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/forgotPassword", forgotPasswordHandler);
authRouter.patch("/resetPassword/:id", resetPasswordHandler);
authRouter.get("/logout", logoutHandler);

export { authRouter };
