import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xl font-bold">Store</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="#" className="text-sm font-medium hover:underline">
              Shop
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              Categories
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="container flex flex-col items-center justify-center space-y-4 py-24 text-center md:py-32">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Discover Our Latest Collection
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Shop the latest trends and find your perfect style. Free shipping on all orders over $50.
            </p>
            <Button className="mt-4" size="lg">
              Shop Now
            </Button>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">Shop by Category</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href="#"
                  className="group relative overflow-hidden rounded-lg border bg-background hover:border-primary"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="object-cover transition-transform group-hover:scale-105"
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">Featured Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <div key={product.name} className="group relative overflow-hidden rounded-lg border">
                  <div className="relative aspect-square">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="object-cover transition-transform group-hover:scale-105"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.price}</p>
                    <Button className="mt-4 w-full" variant="secondary">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="border-t bg-muted/40 py-12 md:py-16">
          <div className="container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tight">Subscribe to Our Newsletter</h2>
              <p className="max-w-[600px] text-gray-500 dark:text-gray-400">
                Stay updated with our latest products and exclusive offers.
              </p>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input type="email" placeholder="Enter your email" />
                <Button type="submit">Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2024 Store. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

const categories = [
  {
    name: "Clothing",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Accessories",
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    name: "Footwear",
    image: "/placeholder.svg?height=400&width=600",
  },
]

const products = [
  {
    name: "Classic White T-Shirt",
    price: "$29.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Denim Jeans",
    price: "$89.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Leather Sneakers",
    price: "$129.99",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Cotton Hoodie",
    price: "$69.99",
    image: "/placeholder.svg?height=400&width=400",
  },
]

