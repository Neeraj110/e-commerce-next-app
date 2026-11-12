import mongoose, { Schema, Model, Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: string;
  totalAmount: number;
  trackingNumber?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  codVerified?: boolean;
  paidAt?: Date;
  createdAt: Date;
}

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    trackingNumber: { type: String },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
    razorpay_signature: { type: String },
    codVerified: { type: Boolean, default: false },
    paidAt: { type: Date },
    // TTL: automatically mark abandoned pending orders eligible for cleanup
    // Set this field when creating a Razorpay order; a cron can query
    // orders where expiresAt < now AND paymentStatus === "pending" to cancel them.
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true }
);

// Compound index: fast lookup of a user's orders sorted by newest first (IXSCAN)
OrderSchema.index({ user: 1, createdAt: -1 });
// Speed up payment-status queries used in verify & webhook routes
OrderSchema.index({ razorpay_order_id: 1 });

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
