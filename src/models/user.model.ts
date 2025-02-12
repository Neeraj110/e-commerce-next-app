import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string;
  name: string;
  role: "user" | "admin";
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }>;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String ,required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isOAuthUser: { type: Boolean, default: false },
    addresses: [
      {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this as unknown as IUser & Document;

  if (!user.isModified("password") || !user.password) {
    return next();
  }

  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function (password: string) {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
