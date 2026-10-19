import express from "express";
import {
  deleteProductById,
  getBigBillionProducts,
  getProducts,
  handleAddProduct,
  handleGetProductById,
  updateProductById,
} from "../controllers/productControllers.js";
import { isBodyEmpty } from "../utils/isBodyEmpty.js";
import { protectRoute, isAuthorized } from "../controllers/authController.js";

const authorizedProductRoles = ["admin", "ceo", "sales"];

const productRouter = express.Router();

// Public endpoint for fetching products (no authentication required)
productRouter.get("/", getProducts);
productRouter.post("/", isBodyEmpty, handleAddProduct);
productRouter.get("/bigBillionProducts", getBigBillionProducts, getProducts);
productRouter.get("/:id", handleGetProductById);
productRouter.patch("/:id", isBodyEmpty, updateProductById);
productRouter.delete(
  "/:id",
  protectRoute,
  isAuthorized(authorizedProductRoles),
  deleteProductById
);

export { productRouter };
