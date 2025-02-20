import Link from "next/link";
import ProductCard from "./ProductCard";
import { IProduct } from "@/models/product.model";

interface ProductListProps {
  products: IProduct[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-[2rem] ">
      {products.map((product, index) => (
        <Link
          href={`/product/${product._id}`}
          key={product._id as string | number}
        >
          <ProductCard product={product} index={index} />
        </Link>
      ))}
    </div>
  );
}
