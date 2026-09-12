import { Request, Response } from "express";
import { uploadToCloudinary } from "../lib/cloudinary.js";

export async function handleImageUpload(req: Request, res: Response) {
  try {
    const { image, folder } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image data (URL or Base64 string) is required" });
    }

    const folderName = folder || "sanskriti_sarees";
    const result = await uploadToCloudinary(image, folderName);

    return res.status(200).json({
      success: true,
      url: result.url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error("Image upload failed:", error);
    return res.status(500).json({
      message: "Cloudinary image upload failed",
      error: error?.message || "Internal server error",
    });
  }
}
