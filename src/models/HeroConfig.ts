import mongoose from "mongoose";

const heroConfigSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: false },
    images: [{ type: String }],
    interval: { type: Number, default: 4000 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const HeroConfig = mongoose.models.HeroConfig || mongoose.model("HeroConfig", heroConfigSchema);
