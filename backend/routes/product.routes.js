import express from "express";
import { createProduct, getProductById, getProducts } from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.post("/", createProduct);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProductById);

export default productRoutes;