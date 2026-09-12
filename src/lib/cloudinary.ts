import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "pkpfahlo",
  api_key: process.env.CLOUDINARY_API_KEY || "767197349147443",
  api_secret: process.env.CLOUDINARY_API_SECRET || "vNAA1uEuOsgkB5CetI-u2gTsDNE",
  secure: true,
});

export async function uploadToCloudinary(
  fileStr: string,
  folder: string = "sanskriti_sarees"
): Promise<{ url: string; public_id: string }> {
  try {
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder,
      resource_type: "auto",
    });
    return {
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

export default cloudinary;
