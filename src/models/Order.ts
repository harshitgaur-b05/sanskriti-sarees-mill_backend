import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
  category: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },       // in paise (INR × 100)
    currency: { type: String, default: "INR" },
    paymentMethod: { type: String, default: "RAZORPAY" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
    orderStatus: {
      type: String,
      enum: ["PLACED", "PROCESSING", "SHIPPED", "DELIVERED"],
      default: "PLACED",
    },
    items: { type: [orderItemSchema], required: true },
    customerName: { type: String },
    customerEmail: { type: String },
    customerPhone: { type: String },
    shippingAddress: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    company: { type: String },
    apartment: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
