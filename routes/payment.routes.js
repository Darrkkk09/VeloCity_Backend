const express = require('express');
const Razorpay = require('razorpay');
require('dotenv').config();
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET
});

router.get('/get-key', authMiddleware.authUser, async (req, res) => {
    try {
        res.json({ key: process.env.RAZORPAY_KEY });
    } catch (err) {
        console.error('Razorpay key fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch key' });
    }
});

router.post('/create-order', authMiddleware.authUser, async (req, res) => {
    const { amount } = req.body;
    try {
        const options = {
            amount: amount * 100, 
            currency: "INR",
            receipt: `receipt_uber_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);

        
    } catch (err) {
        console.error('Order Creation Error:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
router.post('/verify-payment', (req, res) => {
    

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }
    

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        return res.json({ success: true });
    } else {
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }

});

module.exports = router;
