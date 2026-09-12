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
        imageUrl: "",
        images: [],
        imageUrls: [],
        slides: [],
        interval: 4000
      });
    }

    let slides: { imageUrl: string; targetUrl: string }[] = [];
    if (Array.isArray(hero.slides) && hero.slides.length > 0) {
      slides = hero.slides.map((s: any) => ({
        imageUrl: s.imageUrl || "",
        targetUrl: s.targetUrl || "/products"
      }));
    } else {
      const imgList = Array.isArray(hero.images) && hero.images.length > 0
        ? hero.images
        : (hero.imageUrl ? [hero.imageUrl] : []);
      slides = imgList.map((img: string) => ({ imageUrl: img, targetUrl: "/products" }));
    }

    const images = slides.map(s => s.imageUrl);

    return res.json({
      _id: hero._id,
      imageUrl: hero.imageUrl || images[0] || "",
      images,
      imageUrls: images,
      slides,
      interval: hero.interval || 4000
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch hero image" });
  }
}

export async function updateHeroConfig(req: Request, res: Response) {
  try {
    const { imageUrl, images, imageUrls, slides: inputSlides, interval } = req.body;

    let slidesToSave: { imageUrl: string; targetUrl: string }[] = [];

    if (Array.isArray(inputSlides)) {
      slidesToSave = inputSlides.map((s: any) => ({
        imageUrl: typeof s === "string" ? s : (s.imageUrl || ""),
        targetUrl: typeof s === "object" && s.targetUrl ? s.targetUrl : "/products"
      })).filter(s => s.imageUrl.length > 0);
    } else {
      const listToSave: string[] = Array.isArray(images) && images.length > 0
        ? images
        : Array.isArray(imageUrls) && imageUrls.length > 0
        ? imageUrls
        : (imageUrl ? [imageUrl] : []);

      slidesToSave = listToSave.map((img) => ({ imageUrl: img, targetUrl: "/products" }));
    }

    const imagesToSave = slidesToSave.map(s => s.imageUrl);
    const firstImage = imagesToSave[0] || "";
    const targetInterval = typeof interval === "number" && interval >= 1000 ? interval : 4000;

    const existing = await HeroConfig.findOne();
    let hero;
    if (existing) {
      hero = await HeroConfig.findByIdAndUpdate(
        existing._id,
        {
          imageUrl: firstImage,
          images: imagesToSave,
          slides: slidesToSave,
          interval: targetInterval
        },
        { new: true }
      );
    } else {
      hero = await HeroConfig.create({
        imageUrl: firstImage,
        images: imagesToSave,
        slides: slidesToSave,
        interval: targetInterval
      });
    }

    const savedSlides = hero.slides && hero.slides.length > 0
      ? hero.slides.map((s: any) => ({ imageUrl: s.imageUrl, targetUrl: s.targetUrl || "/products" }))
      : slidesToSave;
    const savedImages = savedSlides.map((s: any) => s.imageUrl);

    return res.json({
      _id: hero._id,
      imageUrl: hero.imageUrl,
      images: savedImages,
      imageUrls: savedImages,
      slides: savedSlides,
      interval: hero.interval || 4000
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update hero image" });
  }
}
