import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getOrders,
  getOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Standard and alias endpoints for Razorpay Checkout
router.post("/create", createOrder);
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/verify-payment", verifyPayment);
router.post("/webhook", handleWebhook);

router.get("/", auth, getOrders);
router.get("/:id", auth, getOrder);
router.put("/:id/status", auth, updateOrderStatus);

export default router;
