import "dotenv/config";
import Razorpay from "razorpay";

const cleanKey = (val) => val ? val.trim().replace(/^["']|["']$/g, '').trim() : '';

export const getRazorpayInstance = () => {
    const keyId = cleanKey(process.env.RAZORPAY_KEY_ID);
    const keySecret = cleanKey(process.env.RAZORPAY_KEY_SECRET);

    if (!keyId || !keySecret) {
        return null;
    }

    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};

export const isRazorpayConfigured = () => {
    const keyId = cleanKey(process.env.RAZORPAY_KEY_ID);
    const keySecret = cleanKey(process.env.RAZORPAY_KEY_SECRET);
    return Boolean(keyId && keySecret);
};

export const razorpay = getRazorpayInstance();
export const razorpayConfigAvailable = isRazorpayConfigured();

