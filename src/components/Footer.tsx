"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

const paymentMethods = [
  { name: "Stripe", image: "/strpie.png" },
  { name: "Visa", image: "/visa.png" },
  { name: "Mastercard", image: "/mastercard.png" },
  { name: "Amazon", image: "/amazonpay.jpg" },
  { name: "Klarna", image: "/razorpay.png" },
  { name: "PayPal", image: "/paypal.png" },
  { name: "Apple Pay", image: "/applepay.png" },
  { name: "Google Pay", image: "/G-pay.jpg" },
];

const departmentLinks = [
  "Fashion",
  "Education Product",
  "Frozen Food",
  "Beverages",
  "Organic Grocery",
  "Office Supplies",
  "Beauty Products",
  "Books",
  "Electronics & Gadget",
  "Travel Accessories",
  "Fitness",
  "Sneakers",
  "Toys",
  "Furniture",
];

const aboutLinks = [
  "About Shopcart",
  "Careers",
  "News & Blog",
  "Help",
  "Press Center",
  "Shop By Location",
  "Shopcart Brands",
  "Affiliate & Partners",
  "Ideas & Guides",
];

const servicesLinks = [
  "Gift Card",
  "Mobile App",
  "Shipping & Delivery",
  "Order Pickup",
  "Account Signup",
];

const helpLinks = [
  "Shopcart Help",
  "Returns",
  "Track Orders",
  "Contact Us",
  "Feedback",
  "Security & Fraud",
];

function Footer() {
  return (
    <footer className="bg-white pt-16 pb-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          <div className="lg:col-span-1 max-sm:px-[1.5rem]">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold">EasyCary</span>
            </div>
            <p className="text-gray-600 mb-8">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>
            <div>
              <h3 className="font-semibold mb-4">Accepted Payments</h3>
              <div className="grid grid-cols-4 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="bg-gray-50 p-2 rounded flex items-center justify-center"
                  >
                    <img src={method.image} alt={method.name} className="h-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pl-[1.5rem]">
            <h3 className="font-semibold text-lg mb-4">Department</h3>
            <ul className="space-y-3">
              {departmentLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-orange-600 hover:pl-[.4rem]"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">About Us</h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-orange-600 hover:pl-[.4rem]"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-orange-600 hover:pl-[.4rem]"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Help</h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-orange-600 hover:pl-[.4rem]"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-8">
            <Link href="#" className="flex items-center gap-2">
              <span className="text-pink-600">⬤</span>
              <span>Become Seller</span>
            </Link>
            <Link href="#" className="flex items-center gap-2">
              <span className="text-pink-600">🎁</span>
              <span>Gift Cards</span>
            </Link>
            <Link href="#" className="flex items-center gap-2">
              <span className="text-pink-600">❓</span>
              <span>Help Center</span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="#" className="text-gray-600 hover:text-gray-900">
              Privacy & Policy
            </Link>
            <span className="text-gray-600">
              All Right reserved by XYZ{" "}
              <Link href="#" className="text-green-600 hover:text-green-700">
                ui/ux design
              </Link>{" "}
              agency | 2022
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
