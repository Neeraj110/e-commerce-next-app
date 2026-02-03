import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerSession } from "next-auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import authOptions from "@/lib/authOption";
import SessionWrapper from "@/utils/SessionProvider";
import ClientProvider from "@/ClientProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modern E-commerce Store",
  description: "Shop the latest trends in fashion and accessories",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <Script
          id="seo-optimizer"
          src="http://localhost:4444/sniffer.js"
          strategy="afterInteractive"
          data-site-id="91730e60-6d10-4b63-b956-cb5674a2bc02"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper session={session}>
          <ClientProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Toaster />
              <Navbar />
              <div className="mt-[4.5rem]">{children}</div>
              <Footer />
            </Suspense>
          </ClientProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
