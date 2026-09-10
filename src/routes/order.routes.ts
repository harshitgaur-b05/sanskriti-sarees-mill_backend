import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  getOrders,
  getOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.get("/", getOrders);
router.get("/:id", getOrder);

export default router;
