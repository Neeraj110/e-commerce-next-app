import Image from "next/image";
import { Star } from "lucide-react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { IProduct } from "@/models/product.model";

interface ProductCardProps {
  product: IProduct;
  index: number;
  isdes?: boolean;
}

export default function ProductCard({
  product,
  index,
  isdes = false,
}: ProductCardProps) {
  return (
    <Card className="group relative overflow-hidden rounded-lg border hover:border-primary">
      {/* Image Section with responsive sizing */}

      <div className="relative w-full h-auto">
        {/* Responsive container with different aspect ratios for different screen sizes */}
        <div className="relative pt-[80%] sm:pt-[90%] md:pt-[100%]">
          <Image
            src={product.images[0]?.url } 
            alt={product.title}
            className="object-contain p-2 absolute inset-0 w-full h-full transition-transform group-hover:scale-105"
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            priority={index < 4}
          />
        </div>
      </div>

      {/* Card Content */}
      <CardHeader className="p-4">
        <CardTitle className="font-semibold line-clamp-1">
          {product.title}
        </CardTitle>
      </CardHeader>

      {isdes ? (
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </CardContent>
      ) : null}

      <CardFooter className="flex flex-col items-start p-3 sm:p-4 pt-0 sm:pt-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < Math.round(product.rating.rate)
                    ? "fill-primary text-primary"
                    : "fill-muted stroke-muted-foreground"
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground">
            ({product.rating.count})
          </span>
        </div>
        <p className="mt-1 sm:mt-2 font-semibold text-sm sm:text-base">
          ₹{product.price}
        </p>
      </CardFooter>
    </Card>
  );
}
