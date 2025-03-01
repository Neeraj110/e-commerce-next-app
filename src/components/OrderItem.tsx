import Image from "next/image";
import React from "react";

function OrderItem({ cart }: any) {
  return (
    <div className="space-y-4">
      {cart.items.map((item: any) => (
        <div key={item._id} className="flex gap-4">
          <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded">
            <Image
              src={item.product.images[0].url || "/placeholder.svg"}
              alt={item.product.title}
              fill
              sizes="100%"
              className="object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <p className="line-clamp-1 text-sm font-medium">
              {item.product.title}
            </p>
            <p className="text-sm text-muted-foreground">
              Qty: {item.quantity}
            </p>
            <p className="text-sm font-medium">₹{item.product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrderItem;
