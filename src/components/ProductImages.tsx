import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface ProductImagesProps {
  images: { url: string }[];
  title: string;
}

export const ProductImages = ({ images, title }: ProductImagesProps) => {
  const primaryImage = images?.[0]?.url || "/placeholder.svg";

  return (
    <Card className="overflow-hidden border-2">
      <CardContent className="p-1 sm:p-2 md:p-4">
        <div className="relative aspect-square rounded-lg bg-white dark:bg-gray-800">
          <Image
            src={primaryImage}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4"
            priority
          />
        </div>
      </CardContent>
    </Card>
  );
};
