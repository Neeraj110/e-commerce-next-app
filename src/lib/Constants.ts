import { ArrowLeft, CreditCard } from "lucide-react";

const SHIPPING_METHODS = [
  {
    id: "free",
    name: "Free Shipping",
    description: "5-7 business days",
    price: 0,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 15,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next business day",
    price: 30,
  },
];

const PAYMENT_METHODS = [
  { id: "razorpay", name: "Credit/Debit Card (Razorpay)", icon: CreditCard },
  { id: "cod", name: "Cash on Delivery", icon: ArrowLeft },
];

export { SHIPPING_METHODS, PAYMENT_METHODS };
