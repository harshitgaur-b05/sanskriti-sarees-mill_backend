import { Request, Response } from "express";
import { Product } from "../models/Product.js";

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    let product = null;
    if (id && typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    }
    if (!product && id) {
      product = await Product.findOne({ slug: id });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const {
      name,
      slug,
      description,
      price,
      stock,
      image,
      category,
      isBestSeller,
      sku,
      occasion,
      washCare,
      sareeDimension,
      blouseType,
      blouseDimension,
      craft,
    } = req.body;

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const product = await Product.create({
      name,
      slug: generatedSlug,
      description,
      price: Number(price),
      stock: Number(stock || 0),
      image,
      category,
      isBestSeller: Boolean(isBestSeller),
      sku,
      occasion,
      washCare,
      sareeDimension,
      blouseType,
      blouseDimension,
      craft,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create product" });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (data.price !== undefined) data.price = Number(data.price);
    if (data.stock !== undefined) data.stock = Number(data.stock);
    if (data.isBestSeller !== undefined) data.isBestSeller = Boolean(data.isBestSeller);

    const product = await Product.findByIdAndUpdate(id, data, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update product" });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to delete product" });
  }
}

export async function seedProducts(req: Request, res: Response) {
  try {
    const sampleSarees = [
      {
        name: "Royal Kanjivaram Silk Saree",
        slug: "royal-kanjivaram-silk-saree",
        description: "Exquisite handwoven Kanjivaram silk saree with intricate pure zari borders and rich pallu, perfect for weddings and festivities.",
        price: 14999,
        stock: 15,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
        category: "Kanjivaram",
        isBestSeller: true
      },
      {
        name: "Banarasi Zari Work Saree",
        slug: "banarasi-zari-work-saree",
        description: "Traditional Banarasi brocade silk saree adorned with floral jaal pattern and ornate golden thread work.",
        price: 12499,
        stock: 20,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
        category: "Banarasi",
        isBestSeller: true
      },
      {
        name: "Handcrafted Chanderi Cotton Saree",
        slug: "handcrafted-chanderi-cotton-saree",
        description: "Lightweight and elegant Chanderi saree featuring traditional motifs and a shimmering silver border.",
        price: 4599,
        stock: 35,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
        category: "Chanderi",
        isBestSeller: false
      },
      {
        name: "Classic Bandhani Tie & Dye Saree",
        slug: "classic-bandhani-tie-dye-saree",
        description: "Vibrant Gujarati Bandhani saree crafted on pure georgette fabric with authentic dot patterns.",
        price: 6800,
        stock: 18,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
        category: "Bandhani",
        isBestSeller: true
      },
      {
        name: "Pure Organza Floral Printed Saree",
        slug: "pure-organza-floral-printed-saree",
        description: "Modern sheer organza saree with delicate pastel floral prints and scalloped embroidery edge.",
        price: 5299,
        stock: 25,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
        category: "Organza",
        isBestSeller: false
      },
      {
        name: "Heritage Tussar Silk Saree",
        slug: "heritage-tussar-silk-saree",
        description: "Rich textured Tussar silk saree with tribal hand-block prints and natural earthy tones.",
        price: 8900,
        stock: 12,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
        category: "Tussar Silk",
        isBestSeller: false
      },
      {
        name: "Bridal Velvet Border Saree",
        slug: "bridal-velvet-border-saree",
        description: "Heavy designer bridal saree with deep red hues, velvet contrast border, and stone embroidery.",
        price: 18500,
        stock: 8,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
        category: "Bridal Wear",
        isBestSeller: true
      },
      {
        name: "Patan Patola Silk Saree",
        slug: "patan-patola-silk-saree",
        description: "Double ikat weave Patan Patola saree showcasing geometric motifs and vibrant double-sided color.",
        price: 24000,
        stock: 5,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
        category: "Patola",
        isBestSeller: true
      },
      {
        name: "Soft Linen Casual Wear Saree",
        slug: "soft-linen-casual-wear-saree",
        description: "Breathable pure linen saree with minimalist stripe border, ideal for daily sophistication.",
        price: 3499,
        stock: 40,
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
        category: "Linen",
        isBestSeller: false
      },
      {
        name: "Paithani Peacock Motif Saree",
        slug: "paithani-peacock-motif-saree",
        description: "Maharashtrian Paithani silk saree featuring signature gold zari pallu decorated with peacock motifs.",
        price: 16200,
        stock: 10,
        image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
        category: "Paithani",
        isBestSeller: true
      }
    ];

    await Product.deleteMany({});
    const created = await Product.insertMany(sampleSarees);

    return res.status(201).json({
      message: "Successfully seeded 10 sarees!",
      count: created.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to seed products" });
  }
}