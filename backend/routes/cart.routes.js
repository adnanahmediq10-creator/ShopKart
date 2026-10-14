import express from "express";
import { addToCart, getCart, updateCartItem, removeFromCart } from "../controllers/cart.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const cartRoutes = express.Router();

cartRoutes.post("/:productId", isAuthenticated, addToCart);
cartRoutes.get("/", isAuthenticated, getCart);
cartRoutes.patch("/:productId", isAuthenticated, updateCartItem);
cartRoutes.delete("/:productId", isAuthenticated, removeFromCart);

export default cartRoutes;
