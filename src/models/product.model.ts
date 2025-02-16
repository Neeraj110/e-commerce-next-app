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
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    stock: { type: Number, required: true },
    specifications: { type: Map, of: String },
    rating: {
      rate: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
