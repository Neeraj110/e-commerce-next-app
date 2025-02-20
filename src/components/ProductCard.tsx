import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

import { IProduct } from "@/models/product.model";

interface ProductCardProps {
  product: IProduct;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
        <div className="relative h-48 sm:h-64">
          <Image
            src={product.images[0].url}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index < 4}
            loading={index < 4 ? "eager" : "lazy"}
          />
        </div>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base sm:text-lg line-clamp-2">
            {product.title}
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            {product.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p> */}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="text-base sm:text-lg font-semibold">
            ₹{product.price.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Stock: {product.stock}
            </span>
            {product.rating.count > 0 && (
              <span className="text-muted-foreground">
                ★ {product.rating.rate.toFixed(1)}
              </span>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
