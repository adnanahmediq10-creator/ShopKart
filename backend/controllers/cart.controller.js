import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
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

        const existingItem = user.cart.find((item) => item.product.toString() === productId);

        if (existingItem) {
            const nextQuantity = existingItem.quantity + 1;

            if (nextQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units available in stock`
                });
            }

            existingItem.quantity = nextQuantity;
        } else {
            if (product.stock <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Product is out of stock"
                });
            }

            user.cart.push({
                product: product._id,
                quantity: 1
            });
        }

        await user.save();

        const updatedUser = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: updatedUser.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "cart.product",
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
            cart: user.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1"
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

        const cartItem = user.cart.find((item) => item.product.toString() === productId);

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available in stock`
            });
        }

        cartItem.quantity = quantity;
        await user.save();

        const updatedUser = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: updatedUser.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const removeFromCart = async (req, res) => {
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

        const itemExists = user.cart.some((item) => item.product.toString() === productId);

        if (!itemExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        user.cart = user.cart.filter((item) => item.product.toString() !== productId);
        await user.save();

        const updatedUser = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: updatedUser.cart
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};
