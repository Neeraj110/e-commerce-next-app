import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  categories: string[];
  images: { url: string; public_id: string }[];
  stock: number;
  specifications: Record<string, string>;
  rating: {
    rate: number;
    count: number;
  };
}

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    categories: [
      {
        type: String,
        trim: true,
        required: true,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    stock: { type: Number, required: true, min: 0 },
    specifications: {
      type: Map,
      of: String,
      default: new Map(),
    },
    rating: {
      rate: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

// Indexes for better query performance
ProductSchema.index({ title: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ price: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
