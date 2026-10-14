import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js'

export const isAuthenticated = async (req,res,next)=>{
    let token = req.cookies?.token

    if (!token) {
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized, Please Login"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await Customer.findById(decoded.customerId)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Not Authorized, Please Login"
            })
        }

        req.user = user
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not Authorized, Please Login"
        })
    }
}