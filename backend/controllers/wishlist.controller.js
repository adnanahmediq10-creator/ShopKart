import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const user = await Customer.findById(req.user._id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized, Please Login"
            });
        }

        const alreadyAdded = user.wishlist.some((item) => item.toString() === productId);

        if (alreadyAdded) {
            return res.status(409).json({
                success: false,
                message: "Product already exists in wishlist"
            });
        }

        user.wishlist.push(product._id);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock"
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized, Please Login"
            });
        }

        return res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const user = await Customer.findById(req.user._id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized, Please Login"
            });
        }

        const isInWishlist = user.wishlist.some((item) => item.toString() === productId);

        if (!isInWishlist) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        user.wishlist = user.wishlist.filter((item) => item.toString() !== productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
