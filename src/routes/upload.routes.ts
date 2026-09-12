import { Router } from "express";
import { handleImageUpload } from "../controllers/upload.controller.js";

const router = Router();

router.post("/upload", handleImageUpload);

export default router;
