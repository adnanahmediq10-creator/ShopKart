import express from "express";
import { createPaymentOrder, getOrderById, getOrders, verifyPayment } from "../controllers/order.controller.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const orderRoutes = express.Router();

orderRoutes.use(isAuthenticated);

orderRoutes.post("/create-payment-order", createPaymentOrder);
orderRoutes.post("/verify-payment", verifyPayment);
orderRoutes.get("/", getOrders);
orderRoutes.get("/:id", getOrderById);

export default orderRoutes;
