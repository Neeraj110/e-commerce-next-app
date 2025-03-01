import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "./ui/button";
import { Link } from "lucide-react";
function EmtyCart() {
  return (
    <div className="container max-w-6xl py-8">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Your cart is empty</CardTitle>
          <CardDescription>
            Add some items to your cart to checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmtyCart;
