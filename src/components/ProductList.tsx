import Link from "next/link";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ProductCard = dynamic(() => import("./ProductCard"), {
  loading: () => <Skeleton className="h-72 w-full rounded-xl" />,
});
import { IProduct } from "@/models/product.model";

interface ProductListProps {
  products: IProduct[];
  isdes?: boolean;
}

export default function ProductList({ products, isdes }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
      {products.map((product, index) => (
        <Link
          href={`/product/${product._id}`}
          key={String(product._id)}
        >
          <ProductCard product={product} index={index} isdes={isdes} />
        </Link>
      ))}
    </div>
  );
}
