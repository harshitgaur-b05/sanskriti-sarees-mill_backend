import { Router } from "express";
import {
  getBlogs,
  createBlog,
  deleteBlog,
  getHeroConfig,
  updateHeroConfig
} from "../controllers/adminExtra.controller.js";

const router = Router();

// Blog routes
router.get("/blogs", getBlogs);
router.post("/blogs", createBlog);
router.delete("/blogs/:id", deleteBlog);

// Hero routes
router.get("/hero", getHeroConfig);
router.put("/hero", updateHeroConfig);

export default router;
