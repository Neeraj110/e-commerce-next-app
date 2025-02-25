import Link from "next/link";
import ProductCard from "./ProductCard";
import { IProduct } from "@/models/product.model";

interface ProductListProps {
  products: IProduct[];
  isdes?: boolean;
}

export default function ProductList({ products, isdes }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-[3rem] py-[3rem] md:px-0 md:py-0 lg:px-0 lg:py-0">
      {products.map((product, index) => (
        <Link
          href={`/product/${product._id}`}
          key={product._id as string | number}
        >
          <ProductCard product={product} index={index} isdes={isdes} />
        </Link>
      ))}
    </div>
  );
}
