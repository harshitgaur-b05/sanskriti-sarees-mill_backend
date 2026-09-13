import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    image: { type: String },
    category: { type: String, required: true },
    isBestSeller: { type: Boolean, default: false },
    // Array of hex color strings e.g. ["#C0392B", "#2C3E50"]
    colors: { type: [String], default: [] },
    // IDs / slugs of similar products
    similarPieces: { type: [String], default: [] },
    // New Fields for V1 specs
    sku: { type: String, default: "" },
    occasion: { type: String, default: "" },
    washCare: { type: String, default: "" },
    sareeDimension: { type: String, default: "" },
    blouseType: { type: String, default: "" },
    blouseDimension: { type: String, default: "" },
    craft: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
