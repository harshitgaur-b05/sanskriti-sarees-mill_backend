import { Request, Response } from "express";
import { Blog } from "../models/Blog.js";
import { HeroConfig } from "../models/HeroConfig.js";

// BLOG CONTROLLERS
export async function getBlogs(req: Request, res: Response) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json(blogs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
}

export async function createBlog(req: Request, res: Response) {
  try {
    const { title, content, image } = req.body;
    const blog = await Blog.create({ title, content, image });
    return res.status(201).json(blog);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create blog" });
  }
}

export async function deleteBlog(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    return res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete blog" });
  }
}

// HERO CONFIG CONTROLLERS
export async function getHeroConfig(req: Request, res: Response) {
  try {
    let hero = await HeroConfig.findOne();
    if (!hero) {
      return res.json({
        imageUrl:
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600"
      });
    }
    return res.json(hero);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch hero image" });
  }
}

export async function updateHeroConfig(req: Request, res: Response) {
  try {
    const { imageUrl } = req.body;
    const existing = await HeroConfig.findOne();
    let hero;
    if (existing) {
      hero = await HeroConfig.findByIdAndUpdate(
        existing._id,
        { imageUrl },
        { new: true }
      );
    } else {
      hero = await HeroConfig.create({ imageUrl });
    }
    return res.json(hero);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update hero image" });
  }
}
