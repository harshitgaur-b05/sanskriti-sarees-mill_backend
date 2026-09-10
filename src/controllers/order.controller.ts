import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/Order.js";

// ── Detect whether real Razorpay keys are configured ─────────────────────────
function isRazorpayConfigured(): boolean {
  const id = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  return (
    id.length > 0 &&
    secret.length > 0 &&
    !id.startsWith("rzp_test_XXXX") &&         // placeholder we put in .env
    id !== "your_razorpay_key_id" &&
    secret !== "your_razorpay_key_secret"
  );
}

// POST /api/orders/create
export async function createOrder(req: Request, res: Response) {
  try {
    const { items, customerName, customerEmail, customerPhone, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const amountInPaise = Math.round(totalAmount * 100);

    // ── MOCK MODE ────────────────────────────────────────────────────────────
    if (!isRazorpayConfigured()) {
      const mockOrderId = `mock_order_${Date.now()}`;

      const order = await Order.create({
        razorpayOrderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        status: "created",
        items,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
      });

      console.log("⚠️  Razorpay keys not configured — returning mock order for testing.");

      return res.status(201).json({
        mock: true,                          // tells the frontend to skip real Razorpay SDK
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        key: "mock_key",
        dbOrderId: order._id,
      });
    }

    // ── LIVE MODE ────────────────────────────────────────────────────────────
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerName: customerName || "",
        customerEmail: customerEmail || "",
      },
    });

    const order = await Order.create({
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    });

    return res.status(201).json({
      mock: false,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      dbOrderId: order._id,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Failed to create order" });
  }
}

// POST /api/orders/verify
export async function verifyPayment(req: Request, res: Response) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // ── MOCK MODE: mock_ prefix means simulated payment ───────────────────────
    if (
      razorpayOrderId?.startsWith("mock_") ||
      razorpayPaymentId?.startsWith("mock_pay_")
    ) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId,
          razorpaySignature: "mock_signature",
          status: "paid",
        },
        { new: true }
      );
      console.log("✅ Mock payment verified for order:", razorpayOrderId);
      return res.json({ success: true, mock: true, order });
    }

    // ── LIVE MODE: verify HMAC signature ─────────────────────────────────────
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      await Order.findOneAndUpdate({ razorpayOrderId }, { status: "failed" });
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    const order = await Order.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: "paid" },
      { new: true }
    );

    return res.json({ success: true, mock: false, order });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
}

// GET /api/orders
export async function getOrders(req: Request, res: Response) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

// GET /api/orders/:id
export async function getOrder(req: Request, res: Response) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
}
