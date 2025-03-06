// components/OrderSummary.tsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrderItem from "@/components/OrderItem";

interface OrderSummaryProps {
  cart: any;
  discountCode: string;
  onDiscountCodeChange: (code: string) => void;
  onApplyDiscount: () => void;
  discountApplied: boolean;
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
}

export function OrderSummary({
  cart,
  discountCode,
  onDiscountCodeChange,
  onApplyDiscount,
  discountApplied,
  subtotal,
  shipping,
  discount,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <OrderItem cart={cart} />
        <Separator />

        {/* Discount Code */}
        <div className="flex gap-2">
          <Input
            placeholder="enter save10 code"
            value={discountCode}
            onChange={(e) => onDiscountCodeChange(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={onApplyDiscount}
            disabled={discountApplied}
          >
            Apply
          </Button>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
          </div>
          {discountApplied && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>Discount (10%)</span>
              <span>-₹{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span>Tax (8%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
