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
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      firstName,
      lastName,
      company,
      apartment,
      city,
      state,
      pincode,
      paymentMethod = "RAZORPAY",
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );
    const amountInPaise = Math.round(totalAmount * 100);
    const orderNumber = `SAN-${Math.floor(10000 + Math.random() * 90000)}`;

    const fullName = customerName || `${firstName || ""} ${lastName || ""}`.trim() || "Valued Customer";
    const fullAddress = shippingAddress || `${apartment ? apartment + ", " : ""}${city || ""}, ${state || ""} ${pincode || ""}`.trim();

    // ── MOCK / COD MODE ────────────────────────────────────────────────────────────
    if (paymentMethod === "COD" || !isRazorpayConfigured()) {
      const mockOrderId = `mock_order_${Date.now()}`;

      const order = await Order.create({
        orderNumber,
        razorpayOrderId: mockOrderId,
        amount: amountInPaise,
        currency: "INR",
        paymentMethod: paymentMethod === "COD" ? "COD" : "RAZORPAY",
        status: paymentMethod === "COD" ? "paid" : "created",
        orderStatus: "PLACED",
        items,
        customerName: fullName,
        customerEmail,
        customerPhone,
        shippingAddress: fullAddress,
        firstName,
        lastName,
        company,
        apartment,
        city,
        state,
        pincode,
      });

      return res.status(201).json({
        mock: true,
        orderId: mockOrderId,
        orderNumber: order.orderNumber,
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
      receipt: `rcpt_${orderNumber}`,
      notes: {
        customerName: fullName,
        customerEmail: customerEmail || "",
      },
    });

    const order = await Order.create({
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      paymentMethod: "RAZORPAY",
      status: "created",
      orderStatus: "PLACED",
      items,
      customerName: fullName,
      customerEmail,
      customerPhone,
      shippingAddress: fullAddress,
      firstName,
      lastName,
      company,
      apartment,
      city,
      state,
      pincode,
    });

    return res.status(201).json({
      mock: false,
      orderId: razorpayOrder.id,
      orderNumber: order.orderNumber,
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

    // ── MOCK MODE ─────────────────────────────────────────────────────────────
    if (
      razorpayOrderId?.startsWith("mock_") ||
      razorpayPaymentId?.startsWith("mock_pay_")
    ) {
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        {
          razorpayPaymentId: razorpayPaymentId || `pay_mock_${Date.now()}`,
          razorpaySignature: "mock_signature",
          status: "paid",
          orderStatus: "PLACED",
        },
        { new: true }
      );
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
      { razorpayPaymentId, razorpaySignature, status: "paid", orderStatus: "PLACED" },
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
    const id = req.params.id as string;
    let order;
    if (id && id.startsWith("SAN-")) {
      order = await Order.findOne({ orderNumber: id });
    } else {
      order = await Order.findById(id);
    }
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
}

// PUT /api/orders/:id/status
export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update order status" });
  }
}
