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
const DEFAULT_HERO_IMAGES = [
  "/screen.png",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=1600"
];

export async function getHeroConfig(req: Request, res: Response) {
  try {
    let hero = await HeroConfig.findOne();
    if (!hero) {
      return res.json({
        imageUrl: DEFAULT_HERO_IMAGES[0],
        images: DEFAULT_HERO_IMAGES,
        imageUrls: DEFAULT_HERO_IMAGES,
        interval: 4000
      });
    }

    const images = Array.isArray(hero.images) && hero.images.length > 0
      ? hero.images
      : (hero.imageUrl ? [hero.imageUrl] : DEFAULT_HERO_IMAGES);

    return res.json({
      _id: hero._id,
      imageUrl: hero.imageUrl || images[0],
      images,
      imageUrls: images,
      interval: hero.interval || 4000
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch hero image" });
  }
}

export async function updateHeroConfig(req: Request, res: Response) {
  try {
    const { imageUrl, images, imageUrls, interval } = req.body;

    const listToSave: string[] = Array.isArray(images) && images.length > 0
      ? images
      : Array.isArray(imageUrls) && imageUrls.length > 0
      ? imageUrls
      : (imageUrl ? [imageUrl] : DEFAULT_HERO_IMAGES);

    const firstImage = listToSave[0] || DEFAULT_HERO_IMAGES[0];
    const targetInterval = typeof interval === "number" && interval >= 1000 ? interval : 4000;

    const existing = await HeroConfig.findOne();
    let hero;
    if (existing) {
      hero = await HeroConfig.findByIdAndUpdate(
        existing._id,
        {
          imageUrl: firstImage,
          images: listToSave,
          interval: targetInterval
        },
        { new: true }
      );
    } else {
      hero = await HeroConfig.create({
        imageUrl: firstImage,
        images: listToSave,
        interval: targetInterval
      });
    }

    const savedImages = hero.images && hero.images.length > 0 ? hero.images : [hero.imageUrl];

    return res.json({
      _id: hero._id,
      imageUrl: hero.imageUrl,
      images: savedImages,
      imageUrls: savedImages,
      interval: hero.interval || 4000
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update hero image" });
  }
}
