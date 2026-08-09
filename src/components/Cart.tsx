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
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Define CartItem type
interface CartItem {
  _id: string;
  product: {
    _id: string;
    title: string;
    price: number;
    images: { url: string; public_id: string }[];
    stock: number;
  };
  quantity: number;
}

export default function Cart() {
  const { data: session, status } = useSession();
  const {
    data,
    isLoading: isCartLoading,
    isError: isCartError,
  } = useGetCartQuery({}, { skip: !session });
  const [updateCart, { isLoading: isUpdating }] = useUpdateCartMutation();
  const [deleteCart, { isLoading: isDeleting }] = useDeleteCartMutation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (session && data && !isCartLoading && !isCartError) {
      const serverCartItems: CartItem[] = data.cart.items.map((item: any) => ({
        _id: item._id,
        product: {
          _id: item.product._id,
          title: item.product.title,
          price: item.product.price,
          images: item.product.images,
          stock: item.product.stock,
        },
        quantity: item.quantity,
      }));

      const serverItemsString = JSON.stringify(serverCartItems);
      const localItemsString = JSON.stringify(cart.items);
      if (serverItemsString !== localItemsString) {
        dispatch(clearCart());
        serverCartItems.forEach((item: any) => dispatch(addToCart(item)));
      }
    }

    if (!session && cart.items.length > 0) {
      dispatch(clearCart());
    }
  }, [data, isCartLoading, isCartError, dispatch, session]);

  const handleQuantityChange = useCallback(
    async (item: CartItem, newQuantity: number) => {
      if (newQuantity < 1 || newQuantity > item.product.stock) {
        toast.error(
          newQuantity < 1
            ? "Quantity cannot be less than 1"
            : `Only ${item.product.stock} items in stock`
        );
        return;
      }

      try {
        dispatch(
          updateQuantity({ productId: item.product._id, quantity: newQuantity })
        );
        await updateCart({
          productId: item.product._id,
          quantity: newQuantity,
          id: item._id,
        }).unwrap();
        toast.success("Quantity updated");
      } catch (error: any) {
        toast.error(error.message || "Failed to update quantity");
      }
    },
    [dispatch, updateCart]
  );

  const handleRemoveItem = useCallback(
    async (item: CartItem) => {
      if (!confirm("Are you sure you want to remove this item from your cart?"))
        return;

      try {
        dispatch(removeFromCart(item.product._id));
        await deleteCart(item._id).unwrap();
        toast.success("Item removed from cart");
      } catch (error: any) {
        toast.error(error.message || "Failed to remove item");
      }
    },
    [dispatch, deleteCart]
  );

  const handleCheckOut = useCallback(() => {
    setIsSheetOpen(false);
    router.push("/checkout");
  }, [router]);

  const handleLogin = useCallback(() => {
    setIsSheetOpen(false);
    router.push("/login");
  }, [router]);

  if (status === "loading") {
    return null;
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open cart"
        >
          <ShoppingBag className="h-6 w-6" />
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

        {session ? (
          isCartLoading ? (
            <div className="flex flex-col gap-4 py-4 pr-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="h-20 w-20 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : isCartError ? (
            <div className="flex h-full items-center justify-center text-red-600">
              {Array.isArray(cart?.items) && cart?.items.length > 0
                ? "Failed to load cart"
                : "No items in cart"}
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4 overflow-auto">
              {cart.items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                </div>
              ) : (
                cart.items.map((item: CartItem) => (
                  <div
                    key={item.product._id}
                    className="flex gap-4 py-4 border-b"
                  >
                    <div className="relative aspect-square h-24 w-24 overflow-hidden rounded">
                      <Image
                        src={
                          item.product.images?.[0]?.url || "/placeholder.svg"
                        }
                        alt={item.product.title}
                        fill
                        sizes="100%"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-medium">
                          {item.product.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item)}
                          disabled={isDeleting}
                          aria-label={`Remove ${item.product.title} from cart`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="mt-1 text-sm font-medium">
                        ₹{item.product.price?.toFixed(2)}
                      </p>

                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                          disabled={isUpdating || item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <p className="w-8 text-center">{item.quantity}</p>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                          disabled={
                            isUpdating || item.quantity >= item.product.stock
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {cart.items.length > 0 && (
                <div className="space-y-4 border-t pr-4 pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-medium">
                      ₹{cart.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCheckOut}
                    disabled={isUpdating || isDeleting}
                  >
                    Checkout
                  </Button>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            <p className="text-lg font-medium">
              Please login to view your cart
            </p>
            <Button onClick={handleLogin}>Login</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
