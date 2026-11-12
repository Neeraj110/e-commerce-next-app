/**
 * src/lib/validations.ts
 * Centralised Zod schemas — imported by API route handlers for server-side
 * validation before any database interaction.
 */
import { z } from "zod";

// ─── Product ──────────────────────────────────────────────────────────────────

export const productSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  description: z.string().min(1, "Description is required").max(5000),
  categories: z
    .array(z.string().min(1))
    .min(1, "At least one category is required"),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .nonnegative("Stock cannot be negative"),
});

export type ProductInput = z.infer<typeof productSchema>;

// ─── Order ────────────────────────────────────────────────────────────────────

const shippingAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

const orderItemSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  quantity: z
    .number({ invalid_type_error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .positive("Quantity must be at least 1"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Item price must be greater than 0"),
});

export const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["razorpay", "cod"], {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
});

export type OrderInput = z.infer<typeof orderSchema>;

// ─── Auth / Register ──────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export type RegisterInput = z.infer<typeof registerSchema>;

