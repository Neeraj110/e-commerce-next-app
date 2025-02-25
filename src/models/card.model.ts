import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICart extends Document {
  user: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  totalItems: number;
  totalAmount: any;
}

const CartSchema = new Schema(
  {
    user: {
      type: String, // Changed from Schema.Types.ObjectId to String
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart: Model<ICart> =
  mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
