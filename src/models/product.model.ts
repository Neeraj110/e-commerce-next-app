import mongoose, { Document, Schema, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  categories: mongoose.Types.ObjectId[];
  images: string[];
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
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    images: [{ type: String }],
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
