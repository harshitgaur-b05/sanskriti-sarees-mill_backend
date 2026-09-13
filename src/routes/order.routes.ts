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

router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.post("/webhook", handleWebhook);
router.get("/", auth, getOrders);
router.get("/:id", auth, getOrder);
router.put("/:id/status", auth, updateOrderStatus);

export default router;
