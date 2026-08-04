import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ProductList from "@/components/ProductList";
import connectDb from "@/config/connectDb";
import Product from "@/models/product.model";
import type { ProductCardProduct } from "@/components/ProductCard";

export const revalidate = 300;

async function getFeaturedProducts(): Promise<ProductCardProduct[]> {
  await connectDb();

  const products = await Product.find()
    .sort({ createdAt: -1 })
    .limit(12)
    .select("_id title description price images rating categories")
    .lean();

  return products.map((product) => ({
    _id: String(product._id),
    title: product.title,
    description: product.description,
    price: product.price,
    images: product.images,
    rating: product.rating,
    categories: product.categories,
  }));
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const categories = ["men's clothing", "jewelery", "rings", "electronics"];

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="container flex flex-col items-center justify-center space-y-4 py-24 text-center md:py-32 ">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Discover Our Latest Collection
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Shop the latest trends and find your perfect style. Free shipping
              on all orders over ₹500.
            </p>
            <div className="flex w-full max-w-sm flex-col gap-4">
              <Button asChild className="w-full">
                <Link href="/product">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-16">
          <div className="container ">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">
              Shop by Category
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/product`}
                  className="group relative overflow-hidden rounded-lg border bg-background hover:border-primary"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={
                        featuredProducts.find((p) =>
                          p.categories.includes(category)
                        )?.images[0]?.url || "/placeholder.jpg"
                      }
                      alt={category}
                      className="object-cover transition-transform group-hover:scale-105"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      priority
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-xl font-semibold text-white capitalize">
                      {category}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* Featured Products */}

        <section className="py-12 md:py-16">
          <div className="container">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">
                Featured Products
              </h2>
              <Button variant="outline" asChild>
                <Link href="/product">View All</Link>
              </Button>
            </div>
            <ProductList products={featuredProducts} />
          </div>
        </section>
      </main>
    </div>
  );
}
