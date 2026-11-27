import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";

// ── Detect whether real Razorpay keys are configured ─────────────────────────
function isRazorpayConfigured(): boolean {
  const id = process.env.RAZORPAY_KEY_ID || "";
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  return (
    id.length > 0 &&
    secret.length > 0 &&
    !id.startsWith("rzp_test_XXXX") &&
    id !== "your_razorpay_key_id" &&
    secret !== "your_razorpay_key_secret"
  );
}

// Helper to decrement stock for paid items
async function reduceStock(items: any[]) {
  for (const item of items) {
    if (item.productId) {
      try {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      } catch (err) {
        console.error(`Failed to decrement stock for product ${item.productId}:`, err);
      }
    }
  }
}

// POST /api/orders/create or /api/create-order
export async function createOrder(req: Request, res: Response) {
  try {
    const {
      amount: directAmount,
      currency = "INR",
      receipt: directReceipt,
      items: rawItems,
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
      sendCatalog = false,
      shippingFee: clientShippingFee,
      paymentMethod = "RAZORPAY",
    } = req.body;

    if (paymentMethod === "COD") {
      return res.status(400).json({
        message: "Cash on Delivery (COD) is not accepted. Sanskriti Sarees Mill operates strictly on 100% prepaid online orders via Razorpay."
      });
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    // Support both direct amount (paise) and cart items
    if (typeof directAmount === "number" && directAmount > 0) {
      calculatedTotal = directAmount / 100;
    } else if (rawItems && Array.isArray(rawItems) && rawItems.length > 0) {
      // ── SERVER-SIDE PRICE & STOCK VALIDATION ─────────────────────────────────
      for (const item of rawItems) {
        const quantity = Math.max(1, Number(item.quantity) || 1);
        const dbProduct = await Product.findById(item.productId);

        if (!dbProduct) {
          return res.status(400).json({
            message: `Product "${item.name || item.productId}" is no longer available.`
          });
        }

        if (dbProduct.stock < quantity) {
          return res.status(400).json({
            message: `Insufficient stock for "${dbProduct.name}". Available: ${dbProduct.stock}, requested: ${quantity}.`
          });
        }

        const itemTotal = dbProduct.price * quantity;
        calculatedTotal += itemTotal;

        validatedItems.push({
          productId: dbProduct._id.toString(),
          name: dbProduct.name,
          price: dbProduct.price,
          quantity,
          image: dbProduct.image || item.image || "",
          category: dbProduct.category || item.category || ""
        });
      }
    } else {
      return res.status(400).json({ message: "Cart is empty or amount is required." });
    }

    // Customer-paid delivery charge
    const shippingFee =
      typeof clientShippingFee === "number" && clientShippingFee >= 0
        ? clientShippingFee
        : 0;

    const finalPayableTotal = calculatedTotal + shippingFee;
    const amountInPaise = Math.round(finalPayableTotal * 100);

    // Validate minimum amount (minimum 100 paise = ₹1.00 as required by Razorpay)
    if (!amountInPaise || amountInPaise < 100) {
      return res.status(400).json({
        message: "Order amount must be at least 100 paise (₹1.00)."
      });
    }

    const orderNumber = `SAN-${Math.floor(10000 + Math.random() * 90000)}`;
    const fullName = customerName || `${firstName || ""} ${lastName || ""}`.trim() || "Valued Customer";
    const fullAddress = shippingAddress || `${apartment ? apartment + ", " : ""}${city || ""}, ${state || ""} ${pincode || ""}`.trim();

    // Check if Razorpay keys are available
    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        message: "Razorpay credentials are not configured on the server."
      });
    }

    // Initialize Razorpay SDK with environment variables
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const receipt = directReceipt || `rcpt_${orderNumber}`;

    // Call Razorpay API to create order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt,
      notes: {
        customerName: fullName,
        customerEmail: customerEmail || "",
        orderNumber,
        subtotal: calculatedTotal.toString(),
        shippingFee: shippingFee.toString(),
      },
    });

    // Create record in database
    const order = await Order.create({
      orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: currency || "INR",
      paymentMethod: "RAZORPAY",
      status: "created",
      orderStatus: "PLACED",
      shippingFee,
      sendCatalog,
      items: validatedItems.length > 0 ? validatedItems : [{
        productId: "custom",
        name: `Order ${orderNumber}`,
        price: calculatedTotal,
        quantity: 1,
      }],
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
      order_id: razorpayOrder.id,
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: razorpayOrder.currency || "INR",
      receipt: razorpayOrder.receipt,
      orderNumber: order.orderNumber,
      key: process.env.RAZORPAY_KEY_ID,
      dbOrderId: order._id,
      subtotal: calculatedTotal,
      shippingFee,
      total: finalPayableTotal,
    });
  } catch (error: any) {
    console.error("Razorpay Create Order Error:", error);
    if (error?.statusCode === 401 || (error?.error?.code === "BAD_REQUEST_ERROR" && error?.error?.description?.toLowerCase().includes("auth"))) {
      return res.status(401).json({ message: "Razorpay authentication failed. Please verify API key and secret." });
    }
    return res.status(500).json({
      message: error?.error?.description || error?.message || "Failed to create Razorpay order"
    });
  }
}

// POST /api/orders/verify or /api/verify-payment
export async function verifyPayment(req: Request, res: Response) {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      order_id,
      payment_id,
      signature,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const effectiveOrderId = razorpay_order_id || razorpayOrderId || order_id;
    const effectivePaymentId = razorpay_payment_id || razorpayPaymentId || payment_id;
    const effectiveSignature = razorpay_signature || razorpaySignature || signature;

    // Validate missing fields
    if (!effectiveOrderId || !effectivePaymentId || !effectiveSignature) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: order_id, payment_id, and signature are required."
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay secret key is not configured on the server."
      });
    }

    // Verify HMAC-SHA256 signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${effectiveOrderId}|${effectivePaymentId}`)
      .digest("hex");

    if (expectedSignature !== effectiveSignature) {
      // Signature mismatch: return 400, do NOT mark as paid
      await Order.findOneAndUpdate({ razorpayOrderId: effectiveOrderId }, { status: "failed" });
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. Signatures do not match."
      });
    }

    // Update order status upon successful signature match
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: effectiveOrderId },
      {
        razorpayPaymentId: effectivePaymentId,
        razorpaySignature: effectiveSignature,
        status: "paid",
        orderStatus: "CONFIRMED"
      },
      { new: true }
    );

    if (order && order.items) {
      await reduceStock(order.items);
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order
    });
  } catch (error: any) {
    console.error("Razorpay Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Internal server error during payment verification"
    });
  }
}

// POST /api/orders/webhook
export async function handleWebhook(req: Request, res: Response) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    if (secret && signature) {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        console.warn("[Webhook] Invalid signature received");
        return res.status(400).json({ status: "invalid_signature" });
      }
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;

    if (event === "payment.captured" && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const order = await Order.findOneAndUpdate(
        { razorpayOrderId },
        { razorpayPaymentId, status: "paid", orderStatus: "CONFIRMED" },
        { new: true }
      );

      if (order && order.items) {
        await reduceStock(order.items);
      }
    } else if (event === "payment.failed" && paymentEntity) {
      const razorpayOrderId = paymentEntity.order_id;
      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { status: "failed", failureReason: paymentEntity.error_description || "Payment failed" }
      );
    }

    return res.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ message: "Webhook handler failed" });
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

    if (!["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].includes(orderStatus)) {
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
