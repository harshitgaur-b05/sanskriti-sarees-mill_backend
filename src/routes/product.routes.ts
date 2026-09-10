import { Router } from "express";

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);
router.post("/seed", seedProducts);
router.get("/:id", getProduct);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;