import mongoose from "mongoose";
import Product from "../models/product.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product data",
                error: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: escapeRegex(search), $options: "i" };
        }

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};