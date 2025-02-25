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
    <footer className="pt-16 pb-12 border-t border-gray-200 dark:border-gray-800">
      <div className="container  px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-1  pr-4 dark:text-white">
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-800">EasyCary</span>
            </div>
            <p className="mb-8 text-gray-600">
              Amet minim mollit non deserunt ullamco est sit aliqua dolor do
              amet sint. Velit officia consequat duis enim velit mollit.
            </p>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Accepted Payments
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="bg-white p-2 rounded-md shadow-sm border border-gray-100 flex items-center justify-center hover:shadow-md transition-shadow duration-200"
                  >
                    <img src={method.image} alt={method.name} className="h-6" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className=" pr-4 dark:text-white">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">
              Department
            </h3>
            <ul className="space-y-3">
              {departmentLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 block hover:translate-x-1"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className=" pr-4 dark:text-white">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">
              About Us
            </h3>
            <ul className="space-y-3">
              {aboutLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 block hover:translate-x-1"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className=" pr-4 dark:text-white">
            <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">
              Services
            </h3>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 block hover:translate-x-1"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-800 border-b border-gray-200 pb-2">
              Help
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-green-600 transition-all duration-200 block hover:translate-x-1"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            <Link
              href="#"
              className="flex items-center gap-2 hover:text-green-600 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2 hover:border-green-600"
            >
              <span className="text-green-600">⬤</span>
              <span>Become Seller</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 hover:text-green-600 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2 hover:border-green-600"
            >
              <span className="text-green-600">🎁</span>
              <span>Gift Cards</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 hover:text-green-600 transition-colors duration-200 border border-gray-200 rounded-full px-4 py-2 hover:border-green-600"
            >
              <span className="text-green-600">❓</span>
              <span>Help Center</span>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 border-t md:border-t-0 border-gray-200 pt-4 md:pt-0 mt-4 md:mt-0 w-full md:w-auto text-center md:text-right">
            <div className="flex gap-4 mb-2 md:mb-0">
              <Link
                href="#"
                className="text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                Privacy & Policy
              </Link>
            </div>
            <span className="text-gray-500 text-sm">
              All Rights reserved by XYZ{" "}
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
