"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  removeFromCart,
  updateQuantity,
  addToCart,
  clearCart,
} from "@/redux/slices/cartSlice";
import type { RootState } from "@/redux/store/store";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  useGetCartQuery,
  useUpdateCartMutation,
  useDeleteCartMutation,
} from "@/redux/fetchApi/cartApi";
import { useEffect, useState } from "react";

export default function Cart() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading, isError } = useGetCartQuery({});
  const [updateCart, { isLoading: isUpdating }] = useUpdateCartMutation();
  const [deleteCart, { isLoading: isDeleting }] = useDeleteCartMutation();

  useEffect(() => {
    if (data && !isLoading && !isError) {
      const formattedCart = {
        items: data.cart.items.map((item: any) => ({
          product: {
            _id: item.product._id,
            title: item.product.title,
            price: item.product.price,
            images: item.product.images,
            stock: item.product.stock,
          },
          quantity: item.quantity,
          _id: item._id,
        })),
      };
      formattedCart.items.forEach((item: any) => dispatch(addToCart(item)));

      if (JSON.stringify(cart.items) !== JSON.stringify(formattedCart.items)) {
        dispatch(clearCart());
        formattedCart.items.forEach((item: any) => dispatch(addToCart(item)));
      }
    }
  }, [data, isLoading, isError, dispatch]);

  const handleQuantityChange = async (
    productId: string,
    quantity: number,
    item: any
  ) => {
    await updateCart({
      productId: productId,
      quantity,
      id: item._id,
    }).unwrap();
  };

  const handleRemoveItem = async (id: any) => {
    dispatch(removeFromCart(id));
    await deleteCart(id).unwrap();
  };

  const handleCheckOut = () => {
    if (session) {
      setIsSheetOpen(false);
      router.push("/checkout");
    } else {
      router.push("/login");
      setIsSheetOpen(false);
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBag className="h-7 w-7" />
          {cart.totalItems > 0 && (
            <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {cart.totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>Cart ({cart.totalItems})</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-auto">
          {cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              <p className="text-lg font-medium">Your cart is empty</p>
            </div>
          ) : (
            cart.items.map((item: any) => (
              <div key={item.product?._id} className="flex gap-4 py-4 border-b">
                <div className="relative aspect-square h-24 w-24 overflow-hidden rounded">
                  <Image
                    src={item.product?.images?.[0]?.url || "/placeholder.svg"}
                    alt={item.product?.title || "Product image"}
                    fill
                    sizes="100%"
                    loading="lazy"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium">
                      {item.product?.title || "Unknown Product"}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item?._id)}
                      className="h-5 w-5 text-muted-foreground hover:text-foreground"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-1 text-sm font-medium">
                    ₹
                    {item.product?.price
                      ? item.product.price.toFixed(2)
                      : "0.00"}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        item.quantity > 1 &&
                        handleQuantityChange(
                          item.product?._id,
                          item.quantity - 1,
                          item
                        )
                      }
                      disabled={isUpdating}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <p className="w-8 text-center">{item.quantity}</p>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleQuantityChange(
                          item.product?._id,
                          item.quantity + 1,
                          item
                        )
                      }
                      disabled={isUpdating}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="space-y-4 border-t pr-4 pt-4">
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-medium">
                ₹{cart.totalAmount?.toFixed(2) || "0.00"}
              </span>
            </div>
            <Button className="w-full" onClick={handleCheckOut}>
              Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
