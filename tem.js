export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Newsletter */}
        <section className="border-t bg-muted/40 py-12 md:py-16">
          <div className="container">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                Subscribe to Our Newsletter
              </h2>
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

    </div>
  );
}

<Card>
  <CardHeader>
    <CardTitle>Payment</CardTitle>
  </CardHeader>
  <CardContent className="grid gap-4">
    <div className="rounded-lg border p-4">
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        <span className="font-medium">Credit Card</span>
      </div>
      <div className="mt-4 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="card">Card Number</Label>
          <Input id="card" placeholder="1234 1234 1234 1234" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="month">Month</Label>
            <Input id="month" placeholder="MM" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Year</Label>
            <Input id="year" placeholder="YY" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cvc">CVC</Label>
            <Input id="cvc" placeholder="123" required />
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>;
