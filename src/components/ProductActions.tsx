import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAddcartMutation } from "@/redux/fetchApi/cartApi";
import { addToCart } from "@/redux/slices/cartSlice";
import { Button } from "@/components/ui/button";
import { Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string;
  stock: number;
}

export const ProductActions = ({ productId, stock }: ProductActionsProps) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [addCart] = useAddcartMutation();

  const handleAddToCart = useCallback(async () => {
    if (stock < 1) {
      toast.error("Out of stock");
      return;
    }
    try {
      await addCart({ productId, quantity: 1 }).unwrap();
      dispatch(
        addToCart({ product: { _id: productId } as any, quantity: 1, _id: "" })
      ); // Simplified; adjust payload
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  }, [addCart, dispatch, productId, stock]);

  // const handleBuyNow = useCallback(async () => {
  //   await handleAddToCart();
  //   router.push(session ? "/checkout" : "/login");
  // }, [session, router]);

  const handleShare = useCallback(() => {
    window.navigator.share({
      title: "Product",
      text: "Check out this product",
      url: window.location.href,
    });
  }, [window.navigator.share, window.location.href]);

  return (
    <div className="flex gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
      {session ? (
        <Button
          size="default"
          className="flex-1 text-sm sm:text-base py-4 sm:py-6 min-w-24"
          onClick={handleAddToCart}
          disabled={stock < 1}
          aria-label="Add to cart"
        >
          Add to Cart
        </Button>
      ) : (
        <Button
          asChild
          size="default"
          className="flex-1 text-sm sm:text-base py-4 sm:py-6"
        >
          <Link href="/login">Login to Add</Link>
        </Button>
      )}

      {/* <Button
        size="default"
        className="flex-1 text-sm sm:text-base py-4 sm:py-6 min-w-24"
        onClick={handleBuyNow}
        aria-label="Buy now"
      >
        Buy Now
      </Button> */}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12"
          aria-label="Add to wishlist"
        >
          <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12"
          aria-label="Share product"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>
    </div>
  );
};
