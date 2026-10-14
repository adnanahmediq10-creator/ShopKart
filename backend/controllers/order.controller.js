import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { getRazorpayInstance, isRazorpayConfigured } from "../config/razorpay.js";

const normalizeText = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
};

const validateShippingAddress = (shippingAddress) => {
    const cleanedShippingAddress = {
        fullName: "",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        pincode: ""
    };

    const errors = [];

    if (!shippingAddress || typeof shippingAddress !== "object") {
        return {
            cleanedShippingAddress,
            errors: ["Shipping address is required."]
        };
    }

    cleanedShippingAddress.fullName = normalizeText(shippingAddress.fullName);
    cleanedShippingAddress.phone = normalizeText(shippingAddress.phone);
    cleanedShippingAddress.addressLine1 = normalizeText(shippingAddress.addressLine1);
    cleanedShippingAddress.city = normalizeText(shippingAddress.city);
    cleanedShippingAddress.state = normalizeText(shippingAddress.state);
    cleanedShippingAddress.pincode = normalizeText(shippingAddress.pincode);

    if (!cleanedShippingAddress.fullName) {
        errors.push("Full name is required.");
    }

    if (!cleanedShippingAddress.phone) {
        errors.push("Phone number is required.");
    } else if (!/^\d{10}$/.test(cleanedShippingAddress.phone)) {
        errors.push("Phone number must contain 10 digits.");
    }

    if (!cleanedShippingAddress.addressLine1) {
        errors.push("Address line is required.");
    }

    if (!cleanedShippingAddress.city) {
        errors.push("City is required.");
    }

    if (!cleanedShippingAddress.state) {
        errors.push("State is required.");
    }

    if (!cleanedShippingAddress.pincode) {
        errors.push("Pincode is required.");
    } else if (!/^\d{6}$/.test(cleanedShippingAddress.pincode)) {
        errors.push("Pincode must contain 6 digits.");
    }

    return { cleanedShippingAddress, errors };
};

export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const { cleanedShippingAddress, errors } = validateShippingAddress(shippingAddress);

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: errors[0]
            });
        }

        const user = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock"
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized, Please Login"
            });
        }

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty. Add products before checkout."
            });
        }

        const products = await Product.find({
            _id: {
                $in: user.cart.map((item) => item.product?._id).filter(Boolean)
            }
        });

        const productMap = new Map(products.map((product) => [String(product._id), product]));

        let totalAmount = 0;
        const orderItems = [];

        for (const cartItem of user.cart) {
            const product = cartItem.product;

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "One or more products in your cart are no longer available."
                });
            }

            const latestProduct = productMap.get(String(product._id));

            if (!latestProduct) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.name || "selected"} is no longer available.`
                });
            }

            if (cartItem.quantity > latestProduct.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${latestProduct.name}.`
                });
            }

            const itemSubtotal = latestProduct.price * cartItem.quantity;
            totalAmount += itemSubtotal;

            orderItems.push({
                product: latestProduct._id,
                name: latestProduct.name,
                price: latestProduct.price,
                quantity: cartItem.quantity,
                image: latestProduct.image || ""
            });
        }

        const pendingOrder = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress: cleanedShippingAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        const razorpayInstance = getRazorpayInstance();

        if (!isRazorpayConfigured() || !razorpayInstance) {
            await Order.findByIdAndDelete(pendingOrder._id);
            return res.status(500).json({
                success: false,
                message: "Razorpay payment gateway is not configured on the server."
            });
        }

        try {
            const amountInPaise = Math.round(totalAmount * 100);
            const razorpayOrder = await razorpayInstance.orders.create({
                amount: amountInPaise,
                currency: "INR",
                receipt: String(pendingOrder._id),
                notes: {
                    shopKartOrderId: String(pendingOrder._id),
                    userId: String(req.user._id)
                }
            });

            pendingOrder.razorpayOrderId = razorpayOrder.id;
            await pendingOrder.save();

            return res.status(200).json({
                success: true,
                shopKartOrderId: pendingOrder._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID?.trim().replace(/^["']|["']$/g, '')
            });
        } catch (error) {
            console.error("Razorpay order creation failed:", error);

            await Order.findByIdAndDelete(pendingOrder._id);

            let errorMessage = error?.error?.description || error?.message || "Unable to create Razorpay order. Please try again.";
            if (error?.statusCode === 401 || error?.error?.description === "Authentication failed") {
                errorMessage = "Razorpay Authentication failed: Invalid or expired RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in backend/.env. Please check your keys in Razorpay Dashboard.";
            }

            return res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    } catch (error) {
        console.error("Order creation unexpected error:", error);
        return res.status(500).json({
            success: false,
            message: error?.message || "Unable to create payment order"
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            shopKartOrderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details."
            });
        }

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(shopKartOrderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this order"
            });
        }

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Payment order ID does not match the saved order."
            });
        }

        if (order.paymentStatus === "PAID" && order.status === "PLACED") {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                order
            });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim().replace(/^["']|["']$/g, '');

        if (!keySecret) {
            return res.status(500).json({
                success: false,
                message: "Razorpay secret is not configured."
            });
        }

        if (typeof razorpay_signature !== "string" || !/^[a-f0-9]+$/i.test(razorpay_signature) || razorpay_signature.length < 64) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature."
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature, "hex");
        const providedBuffer = Buffer.from(razorpay_signature, "hex");

        if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
            return res.status(400).json({
                success: false,
                message: "Payment signature verification failed."
            });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        const customer = await Customer.findById(req.user._id);

        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified and order placed successfully",
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to verify payment"
        });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to load your orders"
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to access this order"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to load order"
        });
    }
};
