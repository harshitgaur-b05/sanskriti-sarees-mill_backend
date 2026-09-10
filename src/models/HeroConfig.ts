import mongoose from "mongoose";

const heroConfigSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const HeroConfig = mongoose.models.HeroConfig || mongoose.model("HeroConfig", heroConfigSchema);
