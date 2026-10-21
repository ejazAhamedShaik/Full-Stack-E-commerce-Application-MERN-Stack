import express from "express";
import {
  verifyPayment,
  createRazorpayOrder,
  createCartRazorpayOrder,
  getUserOrders,
} from "../controllers/orderController.js";
import { protectRoute } from "../controllers/authController.js";

const orderRouter = express.Router();

// This route must appear before /:productId, otherwise "verify" is a product ID.
orderRouter.post("/verify", protectRoute, verifyPayment);
orderRouter.post("/cart", protectRoute, createCartRazorpayOrder);

// Create only the Razorpay order. The database order is created after /verify.
orderRouter.post("/:productId", protectRoute, createRazorpayOrder);

orderRouter.get("/", protectRoute, getUserOrders);

export { orderRouter };
