import Image from "next/image";
import { Star } from "lucide-react";
import { Card, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { IProduct } from "@/models/product.model";

interface ProductCardProps {
  product: IProduct;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow rounded-lg overflow-hidden">
      {/* Image Section inside Card */}
      <div className="relative h-48 sm:h-64">
        <Image
          src={product.images[0]?.url}
          alt={product.title}
          className="object-cover transition-transform hover:scale-105"
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={index < 4}
          loading={index < 4 ? "eager" : "lazy"}
        />
      </div>

      {/* Card Content */}
      <CardHeader className="space-y-2 p-4">
        <CardTitle className="text-base sm:text-lg line-clamp-2">
          {product.title}
        </CardTitle>
      </CardHeader>

      <CardFooter className="flex flex-col sm:flex-row gap-2 justify-between p-4">
        <div className="text-base sm:text-lg font-semibold">
          ₹{product.price.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-sm">
          {/* Rating Section */}
          {product.rating?.count && (
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(product.rating.rate)
                      ? "fill-primary text-primary"
                      : "fill-muted stroke-muted-foreground"
                  }`}
                />
              ))}
            </div>
          )}
          <span className="text-muted-foreground">
            ({product.rating.count})
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
