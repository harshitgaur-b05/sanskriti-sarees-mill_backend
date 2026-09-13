import mongoose from "mongoose";

const slideSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    mobileImageUrl: { type: String, default: "" },
    targetUrl: { type: String, default: "/products" }
  },
  { _id: false }
);

const heroConfigSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: false },
    images: [{ type: String }],
    slides: [slideSchema],
    interval: { type: Number, default: 4000 }
  },
  {
    timestamps: true,
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const HeroConfig = mongoose.models.HeroConfig || mongoose.model("HeroConfig", heroConfigSchema);
